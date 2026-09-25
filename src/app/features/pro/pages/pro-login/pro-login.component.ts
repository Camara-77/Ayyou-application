import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { DriverAuthService } from '../../../delivery/services/driver-auth.service';
import { VendorAuthService } from '../../services/vendor-auth.service';

@Component({
  selector: 'app-pro-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './pro-login.component.html',
  styleUrls: ['./pro-login.component.scss']
})
export class ProLoginComponent {
  identifier: string = '';
  passwordText: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  isMobileMenuOpen: boolean = false;

  private authService = inject(AuthService);
  private driverAuthService = inject(DriverAuthService);
  private vendorAuthService = inject(VendorAuthService);
  private router = inject(Router);

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
    if (!this.identifier || !this.passwordText) {
      this.errorMessage = 'Veuillez saisir votre email ou numéro de téléphone et votre mot de passe.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ identifier: this.identifier, password: this.passwordText }).subscribe({
      next: (res) => {
        this.isLoading = false;
        const dUser = res.utilisateur;
        if (!dUser) {
          this.errorMessage = 'Erreur lors de la récupération des données utilisateur.';
          return;
        }

        const isLivreur = dUser.roles?.includes('LIVREUR') || dUser.mode_actif === 'LIVREUR' || dUser.driver_status != null || dUser.profil_livreur != null;
        const etabType = dUser.etablissement?.type_etablissement;
        const isVendeur = dUser.roles?.includes('VENDEUR') || etabType === 'VENDEUR';
        const isRestaurant = dUser.roles?.includes('RESTAURANT') || etabType === 'RESTAURANT';

        if (isLivreur) {
          const driverStatus = dUser.driver_status || dUser.profil_livreur?.statut_verification;
          const statusEnum = driverStatus === 'VALIDE' ? 'COMPTE_ACTIVE' : (driverStatus === 'REFUSE' ? 'CANDIDATURE_REJETEE' : 'CANDIDATURE_EN_ATTENTE');
          const driverProfile = {
            id: dUser.id,
            firstName: dUser.prenom,
            lastName: dUser.nom,
            name: `${dUser.prenom || ''} ${dUser.nom || ''}`.trim() || 'Livreur AYYOU',
            phone: dUser.numero_telephone,
            email: dUser.email,
            role: 'LIVREUR' as const,
            accountStatus: statusEnum as any,
            vehicleType: dUser.profil_livreur?.type_vehicule || 'Scooter AYYOU Pro',
            activeZone: 'Dakar',
            rating: 5.0,
            completedDeliveries: 0
          };
          this.driverAuthService.setAuthenticatedDriver(driverProfile, res.access || 'jwt_driver_token', true);

          if (driverStatus === 'EN_ATTENTE' || (dUser.pro_status === 'PENDING' && driverStatus !== 'VALIDE')) {
            this.router.navigate(['/pro/onboarding/pending']);
          } else if (driverStatus === 'REFUSE' || (dUser.pro_status === 'REJECTED' && driverStatus !== 'VALIDE')) {
            this.router.navigate(['/pro/onboarding/rejected']);
          } else if (driverStatus === 'VALIDE' || dUser.pro_status === 'APPROVED') {
            this.router.navigate(['/delivery/home']);
          } else {
            this.router.navigate(['/pro/onboarding/pending']);
          }
        } else if (isVendeur) {
          const merchantStatus = dUser.merchant_status || dUser.etablissement?.statut_verification;
          if (merchantStatus === 'EN_ATTENTE' || (dUser.pro_status === 'PENDING' && merchantStatus !== 'VALIDE')) {
            this.router.navigate(['/pro/onboarding/pending']);
          } else if (merchantStatus === 'REFUSE' || (dUser.pro_status === 'REJECTED' && merchantStatus !== 'VALIDE')) {
            this.router.navigate(['/pro/onboarding/rejected']);
          } else if (merchantStatus === 'VALIDE' || dUser.pro_status === 'APPROVED') {
            this.router.navigate(['/pro/vendor/dashboard']);
          } else {
            this.router.navigate(['/pro/onboarding/pending']);
          }
        } else if (isRestaurant) {
          const merchantStatus = dUser.merchant_status || dUser.etablissement?.statut_verification;
          if (merchantStatus === 'EN_ATTENTE' || (dUser.pro_status === 'PENDING' && merchantStatus !== 'VALIDE')) {
            this.router.navigate(['/pro/onboarding/pending']);
          } else if (merchantStatus === 'REFUSE' || (dUser.pro_status === 'REJECTED' && merchantStatus !== 'VALIDE')) {
            this.router.navigate(['/pro/onboarding/rejected']);
          } else if (merchantStatus === 'VALIDE' || dUser.pro_status === 'APPROVED') {
            this.router.navigate(['/pro/restaurant/dashboard']);
          } else {
            this.router.navigate(['/pro/onboarding/pending']);
          }
        } else {
          this.errorMessage = 'Aucun profil professionnel valide associé à ce compte.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.detail || 'Identifiants invalides ou erreur de connexion.';
      }
    });
  }

  onGoogleLogin(): void {
    this.errorMessage = 'La connexion Google PRO est indisponible.';
  }
}
