import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProHeaderComponent } from '../../components/pro-header/pro-header.component';
import { ProBottomNavComponent } from '../../components/pro-bottom-nav/pro-bottom-nav.component';
import { ProAuthService } from '../../../../core/services/pro-auth.service';
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

  openingHoursList = [
    { label: 'Lundi - Jeudi', value: '11:30 - 23:00' },
    { label: 'Vendredi - Samedi', value: '11:30 - 01:00' },
    { label: 'Dimanche', value: '12:00 - 22:30' }
  ];

  constructor(
    private proAuthService: ProAuthService,
    private router: Router
  ) {}

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
    setTimeout(() => {
      this.proAuthService.updateProfile(this.profile);
      this.isSaving = false;
      this.router.navigate(['/pro/profile']);
    }, 400);
  }

  cancel(): void {
    this.router.navigate(['/pro/profile']);
  }
}

