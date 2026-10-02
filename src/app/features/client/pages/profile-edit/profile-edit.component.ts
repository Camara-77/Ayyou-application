import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { AppBottomNavComponent } from '../../components/app-bottom-nav/app-bottom-nav.component';
import { ClientDataService, BackendUserProfile } from '../../../../core/services/client-data.service';
import { AuthService } from '../../../../core/services/auth.service';
import { UserProfile } from '../../../../core/models/client';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    AppHeaderComponent,
    AppBottomNavComponent
  ],
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit {
  userProfile?: UserProfile;
  fullName: string = '';
  phone: string = '';
  email: string = '';
  addressMain: string = '';
  addressSub: string = '';
  birthDate: string = '';
  
  isLoading: boolean = true;
  isSaving: boolean = false;
  isSavedNotification: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private clientDataService: ClientDataService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.clientDataService.getRawUserProfile().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res) {
          this.rawUser = res;
          this.userProfile = {
            name: res.nom_complet || `${res.prenom || ''} ${res.nom || ''}`.trim() || 'Client AYYOU',
            location: res.profil_client?.adresse_principale || 'Dakar, Sénégal',
            avatarUrl: res.profil_client?.photo_avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
            notificationsEnabled: res.profil_client?.notifications_activees ?? true
          };
          this.fullName = res.nom_complet || `${res.prenom || ''} ${res.nom || ''}`.trim();
          this.phone = res.numero_telephone || '';
          this.email = res.email || '';
          if (res.profil_client?.adresse_principale) {
            this.addressMain = res.profil_client.adresse_principale;
          }
          if (res.profil_client?.date_naissance) {
            this.birthDate = res.profil_client.date_naissance;
          }
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = "Impossible de charger les informations du profil. Veuillez vérifier votre connexion.";
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result as string;
        if (result && this.userProfile) {
          this.userProfile.avatarUrl = result;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  rawUser?: BackendUserProfile;

  saveChanges(): void {
    if (this.isSaving) return;
    this.errorMessage = null;

    const parts = (this.fullName || '').trim().split(/\s+/);
    const prenom = parts[0] || '';
    const nom = parts.slice(1).join(' ').trim() || this.rawUser?.nom || prenom || 'Client';
    const birth = (this.birthDate && typeof this.birthDate === 'string') ? this.birthDate.trim() : null;

    const payload: any = {
      prenom,
      nom,
      email: (this.email || '').trim(),
      profil_client: {
        adresse_principale: (this.addressMain || '').trim(),
        date_naissance: birth && birth.length >= 8 ? birth : null
      }
    };

    if (this.userProfile?.avatarUrl && !this.userProfile.avatarUrl.startsWith('http')) {
      payload.profil_client.photo_avatar = this.userProfile.avatarUrl;
    }

    this.isSaving = true;

    this.clientDataService.updateUserProfile(payload).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.isSavedNotification = true;
        
        // Mettre à jour le cache utilisateur local dans AuthService
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          currentUser.firstName = res.prenom;
          currentUser.lastName = res.nom;
          currentUser.email = res.email;
          localStorage.setItem('ayyou_user', JSON.stringify(currentUser));
        }

        setTimeout(() => {
          this.isSavedNotification = false;
          this.router.navigate(['/profile']);
        }, 1200);
      },
      error: (err) => {
        this.isSaving = false;
        this.isSavedNotification = false;
        
        let msg = "Impossible de mettre à jour vos informations. Veuillez réessayer.";
        if (err?.status === 401) {
          msg = "Votre session a expiré. Veuillez vous reconnecter.";
        } else if (err?.error?.errors) {
          const detailStr = this.extractErrorMessage(err.error.errors);
          msg = `Veuillez vérifier les informations saisies (${detailStr})`;
        } else if (err?.error) {
          const detailStr = this.extractErrorMessage(err.error);
          msg = `Veuillez vérifier les informations saisies (${detailStr})`;
        } else if (err?.message) {
          msg = err.message;
        }
        this.errorMessage = msg;
      }
    });
  }

  private extractErrorMessage(errObj: any): string {
    if (!errObj) return '';
    if (typeof errObj === 'string') return errObj;
    if (Array.isArray(errObj)) {
      return errObj.map(e => this.extractErrorMessage(e)).filter(Boolean).join(', ');
    }
    if (typeof errObj === 'object') {
      const parts: string[] = [];
      for (const key of Object.keys(errObj)) {
        const val = errObj[key];
        const valStr = this.extractErrorMessage(val);
        const label = this.getFieldLabel(key);
        if (label) {
          parts.push(`${label}: ${valStr}`);
        } else {
          parts.push(valStr);
        }
      }
      return parts.filter(Boolean).join(' | ');
    }
    return String(errObj);
  }

  private getFieldLabel(key: string): string {
    const labels: { [k: string]: string } = {
      profil_client: '',
      email: 'Adresse e-mail',
      prenom: 'Prénom',
      nom: 'Nom',
      numero_telephone: 'Numéro de téléphone',
      adresse_principale: 'Adresse de livraison',
      date_naissance: 'Date de naissance',
      photo_avatar: 'Photo de profil'
    };
    return labels[key] !== undefined ? labels[key] : key;
  }

  deleteAccount(): void {
    this.router.navigate(['/login']);
  }
}

