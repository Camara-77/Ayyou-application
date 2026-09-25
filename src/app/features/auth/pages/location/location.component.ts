import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthButtonComponent } from '../../components/auth-button/auth-button.component';
import { AuthHeaderComponent } from '../../components/auth-header/auth-header.component';
import { ClientDataService } from '../../../../core/services/client-data.service';

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
  private clientDataService = inject(ClientDataService);

  locating = false;
  locationGranted = false;
  locationError: string | null = null;
  latitude: number | null = null;
  longitude: number | null = null;

  onBack(): void {
    this.router.navigate(['/verify-sms']);
  }

  requestLocation(): void {
    if (this.locationGranted) {
      this.router.navigate(['/home']);
      return;
    }

    if (!('geolocation' in navigator)) {
      this.locationError = 'La géolocalisation n\'est pas supportée par votre navigateur.';
      setTimeout(() => this.router.navigate(['/home']), 1200);
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

        // Envoyer au backend Django REST
        this.clientDataService.updateLocation(this.latitude, this.longitude).subscribe({
          next: () => {
            setTimeout(() => this.router.navigate(['/home']), 600);
          },
          error: () => {
            setTimeout(() => this.router.navigate(['/home']), 600);
          }
        });
      },
      (error) => {
        this.locating = false;
        if (error.code === error.PERMISSION_DENIED) {
          this.locationError = 'Accès à la géolocalisation refusé. Redirection vers l\'accueil...';
        } else {
          this.locationError = 'Impossible de récupérer votre position. Redirection vers l\'accueil...';
        }
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1200);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  skipForNow(): void {
    this.router.navigate(['/home']);
  }

  enterAddressManually(): void {
    this.router.navigate(['/home']);
  }
}
