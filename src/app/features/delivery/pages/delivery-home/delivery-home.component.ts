import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DeliveryService } from '../../../../core/services/delivery.service';
import { Livraison, LivreurProfile } from '../../../../core/models/delivery';
import { DriverAuthService } from '../../services/driver-auth.service';
import { AuthService } from '../../../../core/services/auth.service';
import { DeliveryBottomNavComponent } from '../../components/delivery-bottom-nav/delivery-bottom-nav.component';
import { DeliveryHeaderComponent } from '../../components/delivery-header/delivery-header.component';

@Component({
  selector: 'app-delivery-home',
  standalone: true,
  imports: [CommonModule, DeliveryBottomNavComponent, DeliveryHeaderComponent],
  templateUrl: './delivery-home.component.html',
  styleUrl: './delivery-home.component.scss'
})
export class DeliveryHomeComponent implements OnInit, OnDestroy {
  private deliveryService = inject(DeliveryService);
  private driverAuthService = inject(DriverAuthService);
  private authService = inject(AuthService);
  public router = inject(Router);

  realDriverProfile: LivreurProfile | null = null;
  availableMissions: Livraison[] = [];
  assignedDeliveries: Livraison[] = [];
  backendStats: { courses_terminees: number; gain_total: string; distance_km: string | null; temps_connecte: string | null } | null = null;

  isLoading = true;
  errorMessage = '';
  successMessage = '';
  acceptingId: number | null = null;
  isOnDuty = true;
  isUpdatingAvailability = false;

  // Sorting mode for available missions ('closest' default)
  sortMode: 'closest' | 'all' = 'closest';

  // Timer state for assigned course
  private timerInterval: any = null;
  remainingTime: string = '02:00';
  remainingSeconds: number = 120;

  get driverName(): string {
    if (this.realDriverProfile) {
      const full = `${this.realDriverProfile.prenom || ''} ${this.realDriverProfile.nom || ''}`.trim();
      if (full) return full;
    }
    const legacy = this.driverAuthService.getCurrentDriver();
    if (legacy?.firstName || legacy?.lastName) {
      return `${legacy.firstName || ''} ${legacy.lastName || ''}`.trim();
    }
    const user = this.authService.getCurrentUser();
    if (user?.firstName || user?.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return 'Livreur AYYOU';
  }

  get driverPhoto(): string | null {
    if (this.realDriverProfile?.permis_conduire && this.realDriverProfile.permis_conduire.startsWith('http')) {
      return this.realDriverProfile.permis_conduire;
    }
    return null;
  }

  get assignedCourse(): Livraison | null {
    if (this.assignedDeliveries && this.assignedDeliveries.length > 0) {
      return this.assignedDeliveries[0];
    }
    return null;
  }

  get sortedAvailableMissions(): Livraison[] {
    const list = [...this.availableMissions];
    if (this.sortMode === 'closest') {
      return list;
    }
    return list;
  }

  get isMissionsPage(): boolean {
    return this.router.url.includes('/missions') || this.router.url.includes('/livraisons');
  }

  // Polling state for available missions
  private pollingInterval: any = null;

  ngOnInit(): void {
    this.loadDashboardData();
    this.startAvailablePolling();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.stopAvailablePolling();
  }

  private startAvailablePolling(): void {
    this.stopAvailablePolling();
    this.pollingInterval = setInterval(() => {
      if (this.isOnDuty) {
        this.fetchAvailableDeliveriesSilently();
      }
    }, 10000);
  }

  private stopAvailablePolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  fetchAvailableDeliveriesSilently(): void {
    if (!this.isOnDuty) return;
    this.deliveryService.getAvailableDeliveries().subscribe({
      next: (missions) => {
        this.availableMissions = missions;
      },
      error: () => {}
    });
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // 1. Load Driver Profile
    this.deliveryService.getDriverProfile().subscribe({
      next: (profile) => {
        this.realDriverProfile = profile;
        this.isOnDuty = profile.est_disponible;
        if (this.isOnDuty) {
          this.fetchAvailableDeliveries();
        } else {
          this.availableMissions = [];
          this.isLoading = false;
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });

    // 2. Load Driver Stats
    this.deliveryService.getDriverStats().subscribe({
      next: (stats) => {
        this.backendStats = stats;
      },
      error: () => {}
    });

    // 3. Load Assigned Deliveries
    this.deliveryService.getDeliveries().subscribe({
      next: (deliveries) => {
        this.assignedDeliveries = deliveries.filter(d => d.statut !== 'LIVREE' && d.statut !== 'ANNULEE');
        if (this.assignedCourse) {
          this.startAssignedCourseTimer();
        }
      },
      error: () => {}
    });
  }

  fetchAvailableDeliveries(): void {
    this.deliveryService.getAvailableDeliveries().subscribe({
      next: (missions) => {
        this.availableMissions = missions;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.driverAuthService.logout();
          this.router.navigate(['/livreur/login']);
        } else if (err.status === 403) {
          this.errorMessage = "Votre compte livreur est en attente de vérification par l'administration.";
        }
      }
    });
  }

  startAssignedCourseTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    const totalDuration = 120; // 2 minutes window
    let deadlineMs: number;

    if (this.assignedCourse?.acceptance_deadline) {
      deadlineMs = new Date(this.assignedCourse.acceptance_deadline).getTime();
    } else if (this.assignedCourse?.date_attribution) {
      deadlineMs = new Date(this.assignedCourse.date_attribution).getTime() + (totalDuration * 1000);
    } else if (this.assignedCourse?.created_at) {
      deadlineMs = new Date(this.assignedCourse.created_at).getTime() + (totalDuration * 1000);
    } else {
      deadlineMs = new Date().getTime() + (totalDuration * 1000);
    }

    const now = new Date().getTime();
    this.remainingSeconds = Math.max(0, Math.floor((deadlineMs - now) / 1000));

    this.updateTimerDisplay();

    this.timerInterval = setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
        this.updateTimerDisplay();
      } else {
        clearInterval(this.timerInterval);
        this.loadDashboardData();
      }
    }, 1000);
  }

  private updateTimerDisplay(): void {
    const mins = Math.floor(this.remainingSeconds / 60);
    const secs = this.remainingSeconds % 60;
    this.remainingTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  toggleAvailability(): void {
    if (this.isUpdatingAvailability) return;
    this.isUpdatingAvailability = true;
    const targetStatus = !this.isOnDuty;

    this.deliveryService.updateAvailability(targetStatus).subscribe({
      next: (updatedProfile) => {
        this.isUpdatingAvailability = false;
        this.realDriverProfile = updatedProfile;
        this.isOnDuty = updatedProfile.est_disponible;
        if (this.isOnDuty) {
          this.fetchAvailableDeliveries();
        } else {
          this.availableMissions = [];
        }
      },
      error: (err) => {
        this.isUpdatingAvailability = false;
        this.errorMessage = err.error?.detail || "Impossible de modifier votre statut de disponibilité.";
      }
    });
  }

  acceptMission(mission: Livraison): void {
    if (this.acceptingId) return;

    this.acceptingId = mission.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.deliveryService.acceptDelivery(mission.id).subscribe({
      next: (updated) => {
        this.acceptingId = null;
        this.successMessage = `Mission #${updated.commande_reference} acceptée avec succès !`;
        this.router.navigate(['/livreur/detail', updated.id]);
      },
      error: (err) => {
        this.acceptingId = null;
        if (err.status === 400 || err.status === 409) {
          this.errorMessage = "Cette course vient d'être acceptée par un autre livreur ou n'est plus disponible.";
          this.availableMissions = this.availableMissions.filter(m => m.id !== mission.id);
        } else {
          this.errorMessage = err.error?.detail || "Une erreur est survenue lors de l'acceptation de la mission.";
        }
        this.loadDashboardData();
      }
    });
  }

  declineAssignedCourse(): void {
    if (!this.assignedCourse) return;
    this.errorMessage = '';
    const courseId = this.assignedCourse.id;

    this.deliveryService.declineDelivery(courseId).subscribe({
      next: () => {
        this.successMessage = "Course déclinée avec succès.";
        this.assignedDeliveries = this.assignedDeliveries.filter(d => d.id !== courseId);
        setTimeout(() => {
          this.successMessage = '';
          this.loadDashboardData();
        }, 1500);
      },
      error: (err) => {
        this.errorMessage = err.error?.detail || "Impossible de décliner la course.";
      }
    });
  }

  getEtablissementName(mission: Livraison): string {
    if (mission.etablissements && mission.etablissements.length > 0) {
      return mission.etablissements.map(e => e.nom).join(', ');
    }
    return 'Établissement non renseigné';
  }

  getEtablissementAddress(mission: Livraison): string {
    if (mission.etablissements && mission.etablissements.length > 0) {
      return mission.etablissements[0].adresse || 'Adresse non renseignée';
    }
    return 'Adresse non renseignée';
  }

  getDestinationName(mission: Livraison): string {
    if (mission.nom_destinataire) {
      return mission.nom_destinataire;
    }
    return 'Destinataire non renseigné';
  }

  getDestinationAddress(mission: Livraison): string {
    if (mission.adresse_livraison) {
      return mission.adresse_livraison;
    }
    return 'Adresse de destination non renseignée';
  }

  getFormattedPrice(mission: Livraison): string {
    const raw = mission.frais_livraison ? parseInt(mission.frais_livraison, 10) : 0;
    const priceNum = isNaN(raw) ? 0 : raw;
    return priceNum.toLocaleString('fr-FR');
  }

  getReadinessBadge(mission: Livraison): { text: string; isWarning: boolean } {
    if (mission.statut === 'EN_PREPARATION') {
      return { text: 'En préparation', isWarning: true };
    }
    if (mission.statut === 'PRETE' || mission.statut === 'ACCEPTEE') {
      return { text: 'Prête immédiatement', isWarning: false };
    }
    return { text: 'En attente', isWarning: true };
  }

  get todayStats() {
    const count = this.backendStats ? this.backendStats.courses_terminees : 0;
    const gain = this.backendStats ? this.backendStats.gain_total : '0';

    return {
      completedCount: count,
      netGainsFormatted: gain,
      distanceKm: this.backendStats?.distance_km || 'Non disponible',
      connectedTime: this.backendStats?.temps_connecte || 'Non disponible'
    };
  }

  get attributionSectors(): string[] {
    if (this.realDriverProfile?.secteur_intervention) {
      const sects = this.realDriverProfile.secteur_intervention
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      if (sects.length > 0) return sects;
    }
    return ['Non spécifié'];
  }
}
