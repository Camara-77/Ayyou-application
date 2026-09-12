import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthHeaderComponent } from '../../components/auth-header/auth-header.component';
import { AuthInputComponent } from '../../components/auth-input/auth-input.component';
import { AuthButtonComponent } from '../../components/auth-button/auth-button.component';
import { SocialLoginButtonComponent } from '../../components/social-login-button/social-login-button.component';
import { AuthService } from '../../../../core/services/auth.service';

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
  private authService = inject(AuthService);

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
    
    // Prepare for authentication service call (without Django connection yet)
    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Une erreur est survenue lors de la connexion.';
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/welcome']);
  }

  onSkip(): void {
    this.router.navigate(['/location']);
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
