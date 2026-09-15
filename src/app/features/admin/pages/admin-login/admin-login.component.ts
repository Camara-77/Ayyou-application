import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';
import { AdminLoginBannerComponent } from '../../components/login/admin-login-banner/admin-login-banner.component';
import { AdminLoginFormCardComponent } from '../../components/login/admin-login-form-card/admin-login-form-card.component';
import { AdminTwoFactorModalComponent } from '../../components/login/admin-two-factor-modal/admin-two-factor-modal.component';
import { AdminPasswordRecoveryModalComponent } from '../../components/login/admin-password-recovery-modal/admin-password-recovery-modal.component';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [
    CommonModule,
    AdminLoginBannerComponent,
    AdminLoginFormCardComponent,
    AdminTwoFactorModalComponent,
    AdminPasswordRecoveryModalComponent
  ],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent {
  @ViewChild(AdminPasswordRecoveryModalComponent) recoveryModalComponent?: AdminPasswordRecoveryModalComponent;

  isLoading: boolean = false;
  loginErrorMessage: string | null = null;
  twoFactorErrorMessage: string | null = null;
  recoveryErrorMessage: string | null = null;

  show2FAModal: boolean = false;
  showRecoveryModal: boolean = false;
  pendingRememberDevice: boolean = false;

  constructor(
    private authService: AdminAuthService,
    private router: Router
  ) {}

  onLoginSubmit(payload: { email: string; password: string; rememberDevice: boolean }): void {
    this.isLoading = true;
    this.loginErrorMessage = null;
    this.pendingRememberDevice = payload.rememberDevice;

    this.authService.login(payload.email, payload.password, payload.rememberDevice).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.requires2FA) {
          this.show2FAModal = true;
        } else {
          this.router.navigate(['/admin/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.loginErrorMessage = err.message || 'Échec de la connexion. Vérifiez vos identifiants.';
      }
    });
  }

  onVerifyTwoFactor(code: string): void {
    this.isLoading = true;
    this.twoFactorErrorMessage = null;

    this.authService.verifyTwoFactor(code, this.pendingRememberDevice).subscribe({
      next: () => {
        this.isLoading = false;
        this.show2FAModal = false;
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.twoFactorErrorMessage = err.message || 'Code TOTP invalide. Veuillez réessayer.';
      }
    });
  }

  onGoogleLogin(): void {
    this.isLoading = true;
    this.authService.loginWithGoogle().subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.loginErrorMessage = err.message || 'Échec de la connexion avec Google Workspace.';
      }
    });
  }

  onOpenRecovery(): void {
    this.recoveryErrorMessage = null;
    this.showRecoveryModal = true;
  }

  onRequestRecovery(email: string): void {
    this.isLoading = true;
    this.recoveryErrorMessage = null;

    this.authService.requestPasswordRecovery(email).subscribe({
      next: () => {
        this.isLoading = false;
        if (this.recoveryModalComponent) {
          this.recoveryModalComponent.setSuccessState();
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.recoveryErrorMessage = err.message || 'Impossible d\'envoyer le lien de réinitialisation.';
      }
    });
  }

  onClose2FA(): void {
    this.show2FAModal = false;
    this.twoFactorErrorMessage = null;
  }

  onCloseRecovery(): void {
    this.showRecoveryModal = false;
    this.recoveryErrorMessage = null;
  }
}
