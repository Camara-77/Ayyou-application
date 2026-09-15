import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DriverAuthService, DriverAccountStatus } from '../../services/driver-auth.service';
import { DriverLoginBannerComponent } from '../../components/login/driver-login-banner/driver-login-banner.component';
import { DriverLoginFormCardComponent } from '../../components/login/driver-login-form-card/driver-login-form-card.component';
import { DriverPasswordRecoveryModalComponent } from '../../components/login/driver-password-recovery-modal/driver-password-recovery-modal.component';

@Component({
  selector: 'app-driver-login',
  standalone: true,
  imports: [
    CommonModule,
    DriverLoginBannerComponent,
    DriverLoginFormCardComponent,
    DriverPasswordRecoveryModalComponent
  ],
  templateUrl: './driver-login.component.html',
  styleUrls: ['./driver-login.component.scss']
})
export class DriverLoginComponent implements OnInit {
  @ViewChild(DriverPasswordRecoveryModalComponent) recoveryModalComponent?: DriverPasswordRecoveryModalComponent;

  isLoading: boolean = false;
  loginErrorMessage: string | null = null;
  recoveryErrorMessage: string | null = null;

  showRecoveryModal: boolean = false;
  initialIdentifier: string = '';

  constructor(
    private driverAuthService: DriverAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initialIdentifier = this.driverAuthService.getSavedIdentifier();
  }

  onLoginSubmit(payload: { identifier: string; passwordPin: string; rememberMe: boolean }): void {
    this.isLoading = true;
    this.loginErrorMessage = null;

    // Save or clear remembered identifier securely
    this.driverAuthService.saveRememberedIdentifier(payload.identifier, payload.rememberMe);

    this.driverAuthService.loginLivreur(payload.identifier, payload.passwordPin, payload.rememberMe).subscribe({
      next: (res) => {
        this.isLoading = false;

        if (res.accountStatus && res.accountStatus !== 'COMPTE_ACTIVE') {
          this.loginErrorMessage = this.getAccountStatusMessage(res.accountStatus);
        } else {
          // Success redirection to driver dashboard / home
          this.router.navigate(['/delivery/home']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.loginErrorMessage = err.message || 'Identifiant ou code PIN incorrect.';
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

    this.driverAuthService.requestPasswordRecovery(identifier).subscribe({
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

  private getAccountStatusMessage(status: DriverAccountStatus): string {
    switch (status) {
      case 'CANDIDATURE_EN_ATTENTE':
        return 'Votre dossier est encore en cours de validation par l\'administration AYYOU.';
      case 'DOSSIER_INCOMPLET':
        return 'Votre dossier de candidature est incomplet. Veuillez contacter l\'administration AYYOU.';
      case 'CANDIDATURE_REJETEE':
        return 'Votre candidature n\'a pas été retenue par l\'administration AYYOU.';
      case 'COMPTE_SUSPENDU':
        return 'Votre compte Livreur est actuellement suspendu. Contactez l\'administration AYYOU.';
      case 'COMPTE_DESACTIVE':
        return 'Votre compte Livreur est désactivé.';
      default:
        return 'Accès non autorisé pour ce compte.';
    }
  }
}
