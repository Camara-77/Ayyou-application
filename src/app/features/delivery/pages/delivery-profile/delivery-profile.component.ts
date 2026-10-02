import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DeliveryBottomNavComponent } from '../../components/delivery-bottom-nav/delivery-bottom-nav.component';
import { DeliveryService } from '../../../../core/services/delivery.service';
import { AuthService } from '../../../../core/services/auth.service';
import { LivreurProfile, LivreurDocument } from '../../../../core/models/delivery';

@Component({
  selector: 'app-delivery-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, DeliveryBottomNavComponent],
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
    if (this.profile && this.profile.statut_verification !== 'VALIDE') {
      this.toggleError = 'Votre profil doit être validé par un administrateur pour modifier votre disponibilité.';
      return;
    }

    this.toggleError = null;
    this.isUpdatingAvailability = true;
    const currentStatus = this.profile ? this.profile.est_disponible : true;
    const targetStatus = !currentStatus;

    this.deliveryService.updateAvailability(targetStatus).subscribe({
      next: (updatedProfile) => {
        this.profile = updatedProfile;
        this.isUpdatingAvailability = false;
      },
      error: (err) => {
        console.error('Erreur mise à jour disponibilité:', err);
        if (this.profile) {
          this.profile.est_disponible = targetStatus;
        }
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
    if (!this.profile) return 'Abdoulaye Diop';
    const fullName = `${this.profile.prenom || ''} ${this.profile.nom || ''}`.trim();
    return fullName || 'Abdoulaye Diop';
  }

  get driverAvatarUrl(): string | null {
    if (this.profile?.photo_avatar && (this.profile.photo_avatar.startsWith('http') || this.profile.photo_avatar.startsWith('/'))) {
      return this.profile.photo_avatar;
    }
    if (this.profile?.permis_conduire && (this.profile.permis_conduire.startsWith('http') || this.profile.permis_conduire.startsWith('/'))) {
      return this.profile.permis_conduire;
    }
    return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250';
  }

  get driverInitials(): string {
    if (!this.profile) return 'AD';
    const p = (this.profile.prenom || '').charAt(0).toUpperCase();
    const n = (this.profile.nom || '').charAt(0).toUpperCase();
    return (p + n) || 'AD';
  }

  get sectorCityName(): string {
    if (this.profile?.secteur_intervention && this.profile.secteur_intervention !== 'Non renseigné') {
      return this.profile.secteur_intervention.split(',')[0].trim();
    }
    return 'Dakar';
  }

  get vehicleNameFormatted(): string {
    if (!this.profile) return 'Honda CG 125 Scooter';
    const brandModel = `${this.profile.marque || ''} ${this.profile.modele || ''}`.trim();
    const vType = this.profile.type_vehicule_display || this.profile.type_vehicule || '';
    if (brandModel && vType) return `${brandModel} (${vType})`;
    if (brandModel) return brandModel;
    if (vType) return vType;
    return 'Honda CG 125 Scooter';
  }

  get vehiclePlateFormatted(): string {
    return (this.profile?.immatriculation && this.profile.immatriculation !== 'Non renseigné')
      ? this.profile.immatriculation
      : 'DK-4892-AZ';
  }

  get insuranceExpiryFormatted(): string {
    if (this.profile?.date_expiration_assurance) {
      return this.profile.date_expiration_assurance;
    }
    return "31/12/2025";
  }

  get insuranceStatus(): string {
    return this.profile?.statut_assurance || 'CONFORME';
  }

  get equipmentList(): string[] {
    if (!this.profile?.equipements_certifies) {
      return ['Casque homologué', 'Sac isotherme AYYOU'];
    }
    const list = this.profile.equipements_certifies
      .split(',')
      .map(e => e.trim())
      .filter(e => e.length > 0);
    return list.length > 0 ? list : ['Casque homologué', 'Sac isotherme AYYOU'];
  }

  get sectorIntervention(): string {
    return (this.profile?.secteur_intervention && this.profile.secteur_intervention !== 'Non renseigné')
      ? this.profile.secteur_intervention
      : 'Dakar Plateau, Point E, Fann, Médina, Corniche Ouest';
  }

  get payoutAccountType(): string {
    return (this.profile?.type_compte_reversement && this.profile.type_compte_reversement !== 'Non renseigné')
      ? this.profile.type_compte_reversement
      : 'Wave Sénégal';
  }

  get payoutNumberMasked(): string {
    const raw = this.profile?.numero_reversement || this.profile?.numero_telephone;
    if (!raw) return '+221 77 *** ** 89';

    const cleaned = raw.trim();
    if (cleaned.length >= 9) {
      const prefix = cleaned.substring(0, cleaned.length - 6);
      const suffix = cleaned.substring(cleaned.length - 2);
      return `${prefix} *** ** ${suffix}`;
    }
    return '+221 77 *** ** 89';
  }

  get displayDocuments(): LivreurDocument[] {
    if (this.documents && this.documents.length > 0) {
      return this.documents;
    }
    return [
      { id: 1, type_document: 'CNI', type_document_display: 'Pièce d\'identité (CNI)', statut: 'VALIDE', commentaire: 'République du Sénégal', created_at: '' },
      { id: 2, type_document: 'PERMIS', type_document_display: 'Permis moto (Catégorie A)', statut: 'VALIDE', commentaire: 'Ministère des Transports', created_at: '' },
      { id: 3, type_document: 'CASIER', type_document_display: 'Casier judiciaire (Extrait n°3)', statut: 'VALIDE', commentaire: 'Délivré < 3 mois', created_at: '' }
    ];
  }

  get documentsValidesCount(): number {
    return this.displayDocuments.filter(d => d.statut === 'VALIDE').length;
  }

  get totalDocumentsCount(): number {
    return this.displayDocuments.length;
  }

  viewDocument(doc: LivreurDocument): void {
    if (doc.fichier) {
      window.open(doc.fichier, '_blank');
    }
  }
}
