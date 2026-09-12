import { Component, inject, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { GoogleAuthService, GoogleUserAccount, GoogleCredentialResponse } from '../../../../core/services/google-auth.service';
import { AuthService } from '../../../../core/services/auth.service';

export type AuthState = 'no_account' | 'account_selected' | 'loading' | 'success' | 'failed' | 'cancelled' | 'network_error' | 'account_conflict';

// Initial mockup accounts for visual representation (isolated for easy replacement with live GIS data)
export const MOCK_GOOGLE_ACCOUNTS: GoogleUserAccount[] = [
  {
    sub: 'google_mock_1',
    email: 'alex.martin.pro@gmail.com',
    name: 'Alexandre Martin',
    givenName: 'Alexandre',
    familyName: 'Martin',
    initials: 'AM'
  },
  {
    sub: 'google_mock_2',
    email: 'sarah.k@gmail.com',
    name: 'Sarah K.',
    givenName: 'Sarah',
    familyName: 'K.',
    initials: 'S'
  }
];

@Component({
  selector: 'app-google-auth',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './google-auth.component.html',
  styleUrl: './google-auth.component.scss'
})
export class GoogleAuthComponent implements OnInit, AfterViewInit, OnDestroy {
  private googleAuthService = inject(GoogleAuthService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private location = inject(Location);
  private sub?: Subscription;

  @ViewChild('googleBtnContainer') googleBtnContainer?: ElementRef<HTMLDivElement>;

  // Initialize with mockup accounts for visual display fidelity
  accounts: GoogleUserAccount[] = [...MOCK_GOOGLE_ACCOUNTS];
  selectedAccount: GoogleUserAccount | null = this.accounts[0];
  selectedCredentialToken: string | null = null;

  authState: AuthState = 'account_selected';
  errorMessage: string | null = null;
  infoMessage: string | null = null;

  ngOnInit(): void {
    this.sub = this.googleAuthService.credential$.subscribe({
      next: (res: GoogleCredentialResponse) => {
        this.handleCredentialReceived(res);
      }
    });

    this.googleAuthService.loadScript()
      .then(() => {
        this.googleAuthService.initialize((res) => this.handleCredentialReceived(res));
        if (this.googleBtnContainer?.nativeElement) {
          this.googleAuthService.renderButton(this.googleBtnContainer.nativeElement);
        }
      })
      .catch(() => {
        // Fallback for offline/local environment demo
      });
  }

  ngAfterViewInit(): void {
    if (this.googleBtnContainer?.nativeElement) {
      this.googleAuthService.renderButton(this.googleBtnContainer.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  handleCredentialReceived(res: GoogleCredentialResponse): void {
    const existingIndex = this.accounts.findIndex(a => a.sub === res.user.sub || a.email === res.user.email);
    if (existingIndex >= 0) {
      this.accounts[existingIndex] = res.user;
    } else {
      this.accounts.unshift(res.user);
    }

    this.selectAccount(res.user, res.credential);
  }

  selectAccount(account: GoogleUserAccount, credentialToken?: string): void {
    this.selectedAccount = account;
    if (credentialToken) {
      this.selectedCredentialToken = credentialToken;
    }
    this.authState = 'account_selected';
    this.errorMessage = null;
  }

  useAnotherAccount(): void {
    this.googleAuthService.prompt();
    this.infoMessage = 'Veuillez sélectionner un autre compte dans la fenêtre Google.';
  }

  onBack(): void {
    this.location.back();
  }

  onContinue(): void {
    if (!this.selectedAccount) {
      this.googleAuthService.prompt();
      return;
    }

    this.authState = 'loading';
    this.errorMessage = null;

    const token = this.selectedCredentialToken || 'mock_google_id_token';

    this.authService.loginWithGoogle(token).subscribe({
      next: () => {
        this.authState = 'success';
        setTimeout(() => {
          this.router.navigate(['/location']);
        }, 400);
      },
      error: (err) => {
        if (err.status === 409) {
          this.authState = 'account_conflict';
          this.errorMessage = 'Un compte existe déjà avec cet e-mail via connexion classique. Veuillez vous connecter par mot de passe.';
        } else if (err.status === 0) {
          this.authState = 'network_error';
          this.errorMessage = 'Erreur réseau lors de la communication avec le serveur AYYOU.';
        } else {
          this.authState = 'failed';
          this.errorMessage = 'L\'authentification avec Google a échoué. Veuillez réessayer.';
        }
      }
    });
  }

  get continueButtonText(): string {
    if (this.selectedAccount && this.selectedAccount.givenName) {
      return `Continuer en tant que ${this.selectedAccount.givenName}`;
    }
    if (this.selectedAccount && this.selectedAccount.name) {
      return `Continuer en tant que ${this.selectedAccount.name.split(' ')[0]}`;
    }
    return 'Continuer avec Google';
  }
}
