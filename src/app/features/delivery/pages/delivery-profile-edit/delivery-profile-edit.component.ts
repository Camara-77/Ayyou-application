import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DeliveryService } from '../../../../core/services/delivery.service';
import { LivreurProfile, LivreurDocument } from '../../../../core/models/delivery';

export interface PayoutAccountItem {
  provider: 'WAVE' | 'ORANGE_MONEY' | string;
  provider_name: string;
  numero: string;
  is_principal: boolean;
}

@Component({
  selector: 'app-delivery-profile-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './delivery-profile-edit.component.html',
  styleUrls: ['./delivery-profile-edit.component.scss']
})
export class DeliveryProfileEditComponent implements OnInit {
  private deliveryService = inject(DeliveryService);
  private location = inject(Location);
  private router = inject(Router);

  profile: LivreurProfile | null = null;
  documents: LivreurDocument[] = [];
  isLoading: boolean = true;
  isSaving: boolean = false;
  isUploadingPhoto: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Form Fields
  firstName: string = '';
  lastName: string = '';
  phonePrefix: string = '+221';
  phoneNumber: string = '';
  email: string = '';
  isEmailVerified: boolean = false;

  vehicleModel: string = '';
  vehiclePlate: string = '';
  equipmentList: string[] = ['Casque homologué', 'Sac isotherme AYYOU'];

  zonesList: string[] = ['Plateau', 'Point E', 'Fann', 'Médina', 'Corniche Ouest'];
  newZoneName: string = '';
  showAddZoneModal: boolean = false;

  payoutAccounts: PayoutAccountItem[] = [];
  showAddAccountModal: boolean = false;
  newAccountProvider: 'WAVE' | 'ORANGE_MONEY' = 'WAVE';
  newAccountNumber: string = '';

  avatarPreviewUrl: string | null = null;

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
        this.firstName = profile.prenom || '';
        this.lastName = profile.nom || '';

        // Décomposer le numéro de téléphone (+221 XXX...)
        const rawPhone = (profile.numero_telephone || '').trim();
        if (rawPhone.startsWith('+221')) {
          this.phonePrefix = '+221';
          this.phoneNumber = rawPhone.substring(4).trim();
        } else if (rawPhone.startsWith('221')) {
          this.phonePrefix = '+221';
          this.phoneNumber = rawPhone.substring(3).trim();
        } else {
          this.phonePrefix = '+221';
          this.phoneNumber = rawPhone;
        }

        this.email = profile.email || '';
        this.isEmailVerified = (profile as any).est_verifie ?? true;

        // Véhicule & Immatriculation
        const brandModel = `${profile.marque || ''} ${profile.modele || ''}`.trim();
        this.vehicleModel = brandModel || profile.type_vehicule_display || profile.type_vehicule || 'Moto / Scooter';
        this.vehiclePlate = profile.immatriculation || 'Non renseignée';

        // Équipements
        if (profile.equipements_certifies) {
          const parsedEq = profile.equipements_certifies.split(',').map(e => e.trim()).filter(e => e.length > 0);
          if (parsedEq.length > 0) {
            this.equipmentList = parsedEq;
          }
        }

        // Secteurs (Zones)
        if (profile.secteur_intervention) {
          const parsedZones = profile.secteur_intervention.split(',').map(z => z.trim()).filter(z => z.length > 0);
          if (parsedZones.length > 0) {
            this.zonesList = parsedZones;
          }
        }

        // Comptes de reversement
        if (profile.comptes_reversement && Array.isArray(profile.comptes_reversement) && profile.comptes_reversement.length > 0) {
          this.payoutAccounts = profile.comptes_reversement;
        } else {
          this.payoutAccounts = [
            {
              provider: (profile.type_compte_reversement || 'WAVE').toUpperCase().includes('ORANGE') ? 'ORANGE_MONEY' : 'WAVE',
              provider_name: profile.type_compte_reversement || 'Wave Sénégal',
              numero: profile.numero_reversement || rawPhone || 'Non renseigné',
              is_principal: true
            }
          ];
        }

        this.avatarPreviewUrl = profile.photo_avatar || null;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement profil livreur edit:', err);
        this.errorMessage = 'Impossible de charger les données du profil.';
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
        console.error('Erreur chargement documents:', err);
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  // --- GESTION PHOTO ---
  onPhotoSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    // Aperçu local immédiat
    const reader = new FileReader();
    reader.onload = () => {
      this.avatarPreviewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);

    // Envoi réel API Cloudinary / Backend
    this.isUploadingPhoto = true;
    this.deliveryService.uploadDriverPhoto(file).subscribe({
      next: (res) => {
        this.isUploadingPhoto = false;
        if (res.photo_url) {
          this.avatarPreviewUrl = res.photo_url;
        }
      },
      error: (err) => {
        this.isUploadingPhoto = false;
        console.error('Erreur upload photo avatar:', err);
      }
    });
  }

  // --- GESTION ZONES ---
  removeZone(index: number): void {
    this.zonesList.splice(index, 1);
  }

  openAddZoneModal(): void {
    this.newZoneName = '';
    this.showAddZoneModal = true;
  }

  closeAddZoneModal(): void {
    this.showAddZoneModal = false;
  }

  confirmAddZone(): void {
    const trimmed = this.newZoneName.trim();
    if (trimmed && !this.zonesList.includes(trimmed)) {
      this.zonesList.push(trimmed);
    }
    this.showAddZoneModal = false;
  }

  // --- GESTION REVERSEMENT ---
  selectPrincipalAccount(index: number): void {
    this.payoutAccounts.forEach((acc, i) => {
      acc.is_principal = (i === index);
    });
  }

  openAddAccountModal(): void {
    this.newAccountNumber = '';
    this.newAccountProvider = 'WAVE';
    this.showAddAccountModal = true;
  }

  closeAddAccountModal(): void {
    this.showAddAccountModal = false;
  }

  confirmAddAccount(): void {
    const num = this.newAccountNumber.trim();
    if (!num) return;

    const providerName = this.newAccountProvider === 'WAVE' ? 'Wave Sénégal' : 'Orange Money';
    const hasPrincipal = this.payoutAccounts.some(a => a.is_principal);

    this.payoutAccounts.push({
      provider: this.newAccountProvider,
      provider_name: providerName,
      numero: num.startsWith('+221') ? num : `+221 ${num}`,
      is_principal: !hasPrincipal
    });

    this.showAddAccountModal = false;
  }

  // --- SAUVEGARDE GLOBALE EN BDD ---
  saveProfile(): void {
    this.isSaving = true;
    this.errorMessage = null;
    this.successMessage = null;

    const fullPhone = `${this.phonePrefix} ${this.phoneNumber.trim()}`.trim();
    const principalAccount = this.payoutAccounts.find(a => a.is_principal) || this.payoutAccounts[0];

    const payload: any = {
      prenom: this.firstName.trim(),
      nom: this.lastName.trim(),
      numero_telephone: fullPhone,
      email: this.email.trim(),
      modele: this.vehicleModel.trim(),
      immatriculation: this.vehiclePlate.trim(),
      secteur_intervention: this.zonesList.join(', '),
      equipements_certifies: this.equipmentList.join(', '),
      comptes_reversement: this.payoutAccounts,
      type_compte_reversement: principalAccount ? principalAccount.provider_name : '',
      numero_reversement: principalAccount ? principalAccount.numero : '',
      photo_avatar: this.avatarPreviewUrl || undefined
    };

    this.deliveryService.updateDriverProfile(payload).subscribe({
      next: (updated) => {
        this.profile = updated;
        this.isSaving = false;
        this.successMessage = 'Profil mis à jour avec succès en base de données !';

        setTimeout(() => {
          this.router.navigate(['/delivery/profile']);
        }, 1200);
      },
      error: (err) => {
        this.isSaving = false;
        console.error('Erreur sauvegarde profil:', err);
        this.errorMessage = err?.error?.detail || err?.error?.message || 'Impossible d\'enregistrer les modifications.';
      }
    });
  }

  get driverName(): string {
    const fn = `${this.firstName} ${this.lastName}`.trim();
    return fn || 'Abdoulaye Diop';
  }

  get driverMatricule(): string {
    return (this.profile as any)?.matricule || `#AY-${(this.profile?.id || 1) + 7748}`;
  }

  get documentsValidesCount(): number {
    return this.documents.filter(d => d.statut === 'VALIDE').length || 3;
  }

  get totalDocumentsCount(): number {
    return this.documents.length || 3;
  }
}
