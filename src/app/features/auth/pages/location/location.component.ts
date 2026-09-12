import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthButtonComponent } from '../../components/auth-button/auth-button.component';
import { AuthHeaderComponent } from '../../components/auth-header/auth-header.component';

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [
    CommonModule,
    AuthButtonComponent,
    AuthHeaderComponent
  ],
  templateUrl: './location.component.html',
  styleUrl: './location.component.scss'
})
export class LocationComponent {
  private router = inject(Router);

  locating = false;
  locationGranted = false;
  locationError: string | null = null;
  latitude: number | null = null;
  longitude: number | null = null;

  onBack(): void {
    this.router.navigate(['/verify-sms']);
  }

  requestLocation(): void {
    if (!('geolocation' in navigator)) {
      this.locationError = 'La géolocalisation n\'est pas supportée par votre navigateur.';
      return;
    }

    this.locating = true;
    this.locationError = null;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.locating = false;
        this.locationGranted = true;
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;

        try {
          sessionStorage.setItem('user_lat', this.latitude.toString());
          sessionStorage.setItem('user_lng', this.longitude.toString());
        } catch {}
      },
      (error) => {
        this.locating = false;
        if (error.code === error.PERMISSION_DENIED) {
          this.locationError = 'Accès à la géolocalisation refusé. Vous pouvez saisir votre adresse manuellement.';
        } else {
          this.locationError = 'Impossible de récupérer votre position actuelle. Veuillez réessayer.';
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  skipForNow(): void {
    // Guest or skipped flow
  }

  enterAddressManually(): void {
    // Action prepared for manual address entry
  }
}
