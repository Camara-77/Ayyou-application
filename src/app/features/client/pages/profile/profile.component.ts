import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { AppBottomNavComponent } from '../../components/app-bottom-nav/app-bottom-nav.component';
import { ClientDataService } from '../../../../core/services/client-data.service';
import { AuthService } from '../../../../core/services/auth.service';
import { UserProfile } from '../../../../core/models/client';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    AppHeaderComponent,
    AppBottomNavComponent
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private clientDataService = inject(ClientDataService);
  private authService = inject(AuthService);
  private router = inject(Router);

  userProfile?: UserProfile;
  canSwitchToDriver: boolean = false;
  isSwitchingMode: boolean = false;
  switchError: string | null = null;

  ngOnInit(): void {
    this.clientDataService.getUserProfile().subscribe(profile => {
      this.userProfile = profile;
    });

    const user = this.authService.getCurrentUser();
    if (user) {
      this.canSwitchToDriver = user.hasDriverProfile || user.availableModes?.includes('LIVREUR') || false;
    }

    this.authService.getModes().subscribe({
      next: (res) => {
        this.canSwitchToDriver = res.can_switch_to_driver || (res.available_modes && res.available_modes.includes('LIVREUR')) || false;
      },
      error: () => {
        // Fallback to local user model state
      }
    });
  }

  toggleNotifications(): void {
    if (this.userProfile) {
      this.userProfile.notificationsEnabled = !this.userProfile.notificationsEnabled;
    }
  }

  switchToDriverMode(): void {
    if (!this.canSwitchToDriver) {
      this.router.navigate(['/pro/register']);
      return;
    }

    this.isSwitchingMode = true;
    this.switchError = null;
    this.authService.switchMode('LIVREUR').subscribe({
      next: () => {
        this.isSwitchingMode = false;
        this.router.navigate(['/delivery/home']);
      },
      error: (err) => {
        console.error('Erreur basculement mode livreur:', err);
        this.switchError = 'Impossible de passer en mode Livreur.';
        this.isSwitchingMode = false;
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
