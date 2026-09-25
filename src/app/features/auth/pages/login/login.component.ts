import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthHeaderComponent } from '../../components/auth-header/auth-header.component';
import { AuthInputComponent } from '../../components/auth-input/auth-input.component';
import { AuthButtonComponent } from '../../components/auth-button/auth-button.component';
import { SocialLoginButtonComponent } from '../../components/social-login-button/social-login-button.component';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthModalService } from '../../../../core/services/auth-modal.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    AuthHeaderComponent,
    AuthInputComponent,
    AuthButtonComponent,
    SocialLoginButtonComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private authModalService = inject(AuthModalService);

  loginForm: FormGroup = this.fb.group({
    identifier: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  loading = false;
  errorMessage: string | null = null;

  get isIdentifierInvalid(): boolean {
    const control = this.loginForm.get('identifier');
    return !!(control && control.invalid && control.touched);
  }

  get isPasswordInvalid(): boolean {
    const control = this.loginForm.get('password');
    return !!(control && control.invalid && control.touched);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: () => {
        this.loading = false;
        
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        const pendingAction = this.authModalService.getPendingAction();

        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
        } else if (pendingAction && pendingAction.returnUrl) {
          this.router.navigateByUrl(pendingAction.returnUrl);
          this.authModalService.clearPendingAction();
        } else {
          this.router.navigate(['/location']);
        }
      },
      error: (err) => {
        this.loading = false;
        // Détecter si le backend signale que le numéro n'est pas encore vérifié (HTTP 403)
        if (err.status === 403 && err.error?.errors?.verification_required) {
          this.authService.setPendingPhone(credentials.identifier);
          this.router.navigate(['/verify-sms']);
          return;
        }

        if (err.error?.errors) {
          const errors = err.error.errors;
          if (typeof errors === 'string') {
            this.errorMessage = errors;
          } else if (errors.detail) {
            this.errorMessage = errors.detail;
          } else {
            this.errorMessage = 'Identifiants invalides.';
          }
        } else {
          this.errorMessage = 'Une erreur est survenue lors de la connexion. Veuillez réessayer.';
        }
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/welcome']);
  }

  onSkip(): void {
    this.router.navigate(['/home']);
  }

  onForgotPassword(): void {
    // Navigation or modal for password reset (prepared for future screen)
  }

  onSocialLogin(provider: string): void {
    if (provider === 'google') {
      this.router.navigate(['/google-auth']);
    }
  }
}
