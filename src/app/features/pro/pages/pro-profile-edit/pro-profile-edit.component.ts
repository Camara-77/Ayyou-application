import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ProHeaderComponent } from '../../components/pro-header/pro-header.component';
import { ProBottomNavComponent } from '../../components/pro-bottom-nav/pro-bottom-nav.component';
import { ProAuthService } from '../../../../core/services/pro-auth.service';
import { ProfessionalService, BackendEtablissement } from '../../../../core/services/professional.service';
import { ProfessionalProfile } from '../../../../core/models/pro';

@Component({
  selector: 'app-pro-profile-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProHeaderComponent, ProBottomNavComponent],
  templateUrl: './pro-profile-edit.component.html',
  styleUrls: ['./pro-profile-edit.component.scss']
})
export class ProProfileEditComponent implements OnInit {
  profile!: ProfessionalProfile;
  isSaving: boolean = false;
  cuisineTypesString: string = '';
  selectedLogoFile: File | null = null;
  selectedCoverFile: File | null = null;

  openingHoursList = [
    { label: 'Lundi - Jeudi', value: '11:30 - 23:00' },
    { label: 'Vendredi - Samedi', value: '11:30 - 01:00' },
    { label: 'Dimanche', value: '12:00 - 22:30' }
  ];

  private proAuthService = inject(ProAuthService);
  private professionalService = inject(ProfessionalService);
  private router = inject(Router);

  ngOnInit(): void {
    this.profile = { ...this.proAuthService.getProfile() };
    if (this.profile.cuisineTypes && Array.isArray(this.profile.cuisineTypes)) {
      this.cuisineTypesString = this.profile.cuisineTypes.join(', ');
    } else {
      this.cuisineTypesString = 'Thiéboudienne, Yassa Poulet, Mafé, Thiakry';
    }
  }

  onFileSelected(type: 'cover' | 'logo', event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (type === 'cover') {
        this.selectedCoverFile = file;
      } else {
        this.selectedLogoFile = file;
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (type === 'cover') {
          this.profile.coverUrl = e.target.result;
        } else {
          this.profile.logoUrl = e.target.result;
          this.profile.avatarUrl = e.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile(): void {
    this.isSaving = true;
    if (this.cuisineTypesString) {
      this.profile.cuisineTypes = this.cuisineTypesString
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
    }

    const uploadLogo$ = this.selectedLogoFile
      ? this.professionalService.uploadProductImage(this.selectedLogoFile).pipe(
          map(res => res.image_url),
          catchError(() => of(undefined))
        )
      : of(undefined);

    const uploadCover$ = this.selectedCoverFile
      ? this.professionalService.uploadProductImage(this.selectedCoverFile).pipe(
          map(res => res.image_url),
          catchError(() => of(undefined))
        )
      : of(undefined);

    forkJoin({ logoUrl: uploadLogo$, coverUrl: uploadCover$ }).subscribe({
      next: ({ logoUrl, coverUrl }) => {
        const etabIdNum = parseInt(this.profile.id, 10);
        const backendData: Partial<BackendEtablissement> = {
          nom: this.profile.name,
          slogan: this.profile.tagline || '',
          description: this.profile.description || '',
          adresse: this.profile.address || this.profile.location || '',
          telephone: this.profile.phone || '',
          specialite: this.profile.cuisineTypes ? this.profile.cuisineTypes.join(', ') : '',
          heure_fermeture: this.profile.closingTime || '23h30'
        };

        if (logoUrl) {
          backendData.logo_url = logoUrl;
        }
        if (coverUrl) {
          backendData.couverture_url = coverUrl;
        }

        const targetId = isNaN(etabIdNum) ? 1 : etabIdNum;
        this.professionalService.updateEstablishment(targetId, backendData).subscribe({
          next: (res) => {
            const updatedProfile = this.professionalService.mapEtablissementToProfile(res);
            this.proAuthService.updateProfile(updatedProfile);
            this.isSaving = false;
            this.router.navigate(['/pro/profile']);
          },
          error: () => {
            this.proAuthService.updateProfile(this.profile);
            this.isSaving = false;
            this.router.navigate(['/pro/profile']);
          }
        });
      },
      error: () => {
        this.isSaving = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/pro/profile']);
  }
}

