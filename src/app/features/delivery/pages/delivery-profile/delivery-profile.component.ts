import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DeliveryBottomNavComponent } from '../../components/delivery-bottom-nav/delivery-bottom-nav.component';
import { DeliveryHeaderComponent } from '../../components/delivery-header/delivery-header.component';
import { DeliveryService } from '../../../../core/services/delivery.service';
import { AuthService } from '../../../../core/services/auth.service';
import { LivreurProfile, LivreurDocument } from '../../../../core/models/delivery';

@Component({
  selector: 'app-delivery-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, DeliveryBottomNavComponent, DeliveryHeaderComponent],
  templateUrl: './delivery-profile.component.html',
  styleUrls: ['./delivery-profile.component.scss']
})
export class DeliveryProfileComponent implements OnInit {
  private deliveryService = inject(DeliveryService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private location = inject(Location);

  profile: LivreurProfile | null = null;
  documents: LivreurDocument[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  toggleError: string | null = null;
  isUpdatingAvailability: boolean = false;

  ngOnInit(): void {
    this.loadProfile();
    this.loadDocuments();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.deliveryService.getDriverProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement profil livreur:', err);
        this.errorMessage = 'Impossible de charger le profil livreur.';
        this.isLoading = false;
      }
    });
  }

  loadDocuments(): void {
    this.deliveryService.getDriverDocuments().subscribe({
      next: (docs) => {
        this.documents = docs;
      },
      error: (err) => {
        console.error('Erreur chargement documents livreur:', err);
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  toggleOnDuty(): void {
    if (!this.profile) return;
    if (this.profile.statut_verification !== 'VALIDE') {
      this.toggleError = 'Votre profil doit être validé par un administrateur pour modifier votre disponibilité.';
      return;
    }

    this.toggleError = null;
    this.isUpdatingAvailability = true;
    const targetStatus = !this.profile.est_disponible;

    this.deliveryService.updateAvailability(targetStatus).subscribe({
      next: (updatedProfile) => {
        this.profile = updatedProfile;
        this.isUpdatingAvailability = false;
      },
      error: (err) => {
        console.error('Erreur mise à jour disponibilité:', err);
        this.toggleError = 'Impossible de modifier le statut de disponibilité.';
        this.isUpdatingAvailability = false;
      }
    });
  }

  logoutProSession(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/pro/login']);
    });
  }

  get driverName(): string {
    if (!this.profile) return 'Livreur AYYOU';
    const fullName = `${this.profile.prenom || ''} ${this.profile.nom || ''}`.trim();
    return fullName || 'Livreur AYYOU';
  }

  get driverAvatarUrl(): string | null {
    if (this.profile?.photo_avatar && (this.profile.photo_avatar.startsWith('http') || this.profile.photo_avatar.startsWith('/'))) {
      return this.profile.photo_avatar;
    }
    if (this.profile?.permis_conduire && (this.profile.permis_conduire.startsWith('http') || this.profile.permis_conduire.startsWith('/'))) {
      return this.profile.permis_conduire;
    }
    return null;
  }

  get driverInitials(): string {
    if (!this.profile) return 'LA';
    const p = (this.profile.prenom || '').charAt(0).toUpperCase();
    const n = (this.profile.nom || '').charAt(0).toUpperCase();
    return (p + n) || 'LA';
  }

  get vehicleNameFormatted(): string {
    if (!this.profile) return 'Non renseigné';
    const brandModel = `${this.profile.marque || ''} ${this.profile.modele || ''}`.trim();
    const vType = this.profile.type_vehicule_display || this.profile.type_vehicule || '';
    if (brandModel && vType) return `${brandModel} (${vType})`;
    if (brandModel) return brandModel;
    if (vType) return vType;
    return 'Non renseigné';
  }

  get vehiclePlateFormatted(): string {
    return this.profile?.immatriculation || 'Non renseigné';
  }

  get insuranceExpiryFormatted(): string {
    if (this.profile?.date_expiration_assurance) {
      return this.profile.date_expiration_assurance;
    }
    return 'Date non renseignée';
  }

  get insuranceStatus(): string {
    return this.profile?.statut_assurance || 'CONFORME';
  }

  get equipmentList(): string[] {
    if (!this.profile?.equipements_certifies) return [];
    return this.profile.equipements_certifies
      .split(',')
      .map(e => e.trim())
      .filter(e => e.length > 0);
  }

  get sectorIntervention(): string {
    return this.profile?.secteur_intervention || 'Non renseigné';
  }

  get payoutAccountType(): string {
    return this.profile?.type_compte_reversement || 'Compte de reversement non configuré';
  }

  get payoutNumberMasked(): string {
    const raw = this.profile?.numero_reversement || this.profile?.numero_telephone;
    if (!raw) return 'Non renseigné';

    const cleaned = raw.trim();
    if (cleaned.length >= 9) {
      const prefix = cleaned.substring(0, cleaned.length - 6);
      const suffix = cleaned.substring(cleaned.length - 2);
      return `${prefix} *** ** ${suffix}`;
    }
    return cleaned;
  }

  get documentsValidesCount(): number {
    return this.documents.filter(d => d.statut === 'VALIDE').length;
  }

  get totalDocumentsCount(): number {
    return this.documents.length;
  }

  viewDocument(doc: LivreurDocument): void {
    if (doc.fichier) {
      window.open(doc.fichier, '_blank');
    }
  }
}
