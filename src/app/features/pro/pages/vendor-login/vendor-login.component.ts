import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { VendorAuthService, VendorAccountStatus } from '../../services/vendor-auth.service';
import { VendorLoginBannerComponent } from '../../components/login/vendor-login-banner/vendor-login-banner.component';
import { VendorLoginFormCardComponent } from '../../components/login/vendor-login-form-card/vendor-login-form-card.component';
import { VendorPasswordRecoveryModalComponent } from '../../components/login/vendor-password-recovery-modal/vendor-password-recovery-modal.component';

@Component({
  selector: 'app-vendor-login',
  standalone: true,
  imports: [
    CommonModule,
    VendorLoginBannerComponent,
    VendorLoginFormCardComponent,
    VendorPasswordRecoveryModalComponent
  ],
  templateUrl: './vendor-login.component.html',
  styleUrls: ['./vendor-login.component.scss']
})
export class VendorLoginComponent implements OnInit {
  @ViewChild(VendorPasswordRecoveryModalComponent) recoveryModalComponent?: VendorPasswordRecoveryModalComponent;

  isLoading: boolean = false;
  loginErrorMessage: string | null = null;
  recoveryErrorMessage: string | null = null;

  showRecoveryModal: boolean = false;
  initialIdentifier: string = '';

  constructor(
    private vendorAuthService: VendorAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initialIdentifier = this.vendorAuthService.getSavedIdentifier();
  }

  onLoginSubmit(payload: { identifier: string; passwordText: string; remember24h: boolean }): void {
    this.isLoading = true;
    this.loginErrorMessage = null;

    this.vendorAuthService.saveRememberedIdentifier(payload.identifier, payload.remember24h);

    this.vendorAuthService.loginVendor(payload.identifier, payload.passwordText, payload.remember24h).subscribe({
      next: (res) => {
        this.isLoading = false;

        if (res.accountStatus && res.accountStatus !== 'ACTIF') {
          this.loginErrorMessage = this.getAccountStatusMessage(res.accountStatus);
        } else {
          this.router.navigate(['/pro/vendor/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.loginErrorMessage = err.message || 'Email/téléphone ou mot de passe incorrect.';
      }
    });
  }

  onMarchandLogin(): void {
    this.isLoading = true;
    this.vendorAuthService.loginWithMarchandAccount().subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/pro/vendor/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.loginErrorMessage = err.message || 'Échec de la connexion via le compte marchand AYYOU.';
      }
    });
  }

  onOpenRecovery(): void {
    this.recoveryErrorMessage = null;
    this.showRecoveryModal = true;
  }

  onRequestRecovery(identifier: string): void {
    this.isLoading = true;
    this.recoveryErrorMessage = null;

    this.vendorAuthService.requestPasswordRecovery(identifier).subscribe({
      next: () => {
        this.isLoading = false;
        if (this.recoveryModalComponent) {
          this.recoveryModalComponent.setSuccessState();
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.recoveryErrorMessage = err.message || 'Impossible de transmettre la demande de réinitialisation.';
      }
    });
  }

  onCloseRecovery(): void {
    this.showRecoveryModal = false;
    this.recoveryErrorMessage = null;
  }

  private getAccountStatusMessage(status: VendorAccountStatus): string {
    switch (status) {
      case 'EN_ATTENTE':
        return 'Votre dossier vendeur est encore en cours de validation par l\'administration AYYOU.';
      case 'REJETE':
        return 'Votre demande d\'adhésion vendeur n\'a pas été validée.';
      case 'SUSPENDU':
        return 'Votre compte vendeur est actuellement suspendu. Contactez l\'administration AYYOU.';
      case 'DESACTIVE':
        return 'Votre compte vendeur est actuellement désactivé.';
      default:
        return 'Accès non autorisé pour ce compte.';
    }
  }
}
