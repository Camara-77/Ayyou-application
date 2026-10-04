import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  LoginRequest,
  LoginResponse,
  RegisterFormValue,
  RegisterBackendPayload,
  RegisterResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  DjangoUser,
  User
} from '../models/auth';
import { environment } from '../../../environments/environment';
import { AuthModalService, AuthModalConfig } from './auth-modal.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private authModalService = inject(AuthModalService);

  private readonly ACCESS_TOKEN_KEY = 'ayyou_access_token';
  private readonly REFRESH_TOKEN_KEY = 'ayyou_refresh_token';
  private readonly USER_KEY = 'ayyou_user';
  private readonly PENDING_PHONE_KEY = 'ayyou_pending_phone';
  private readonly ACTIVE_MODE_KEY = 'ayyou_active_mode';

  /**
   * Conserve le numéro de téléphone en attente de vérification OTP SMS.
   */
  setPendingPhone(phone: string): void {
    if (phone) {
      sessionStorage.setItem(this.PENDING_PHONE_KEY, phone.trim());
    }
  }

  getPendingPhone(): string | null {
    return sessionStorage.getItem(this.PENDING_PHONE_KEY);
  }

  clearPendingPhone(): void {
    sessionStorage.removeItem(this.PENDING_PHONE_KEY);
  }

  /**
   * Inscription Client (POST /api/auth/register/)
   * Effectue le mapping des champs Angular -> Django REST.
   */
  register(formData: RegisterFormValue): Observable<RegisterResponse> {
    const url = `${environment.apiUrl}/api/auth/register/`;
    const payload: RegisterBackendPayload = {
      prenom: formData.firstName.trim(),
      nom: formData.lastName.trim(),
      numero_telephone: formData.phone.trim(),
      email: formData.email.trim(),
      password: formData.password,
      password_confirmation: formData.passwordConfirmation
    };

    return this.http.post<RegisterResponse>(url, payload).pipe(
      tap(() => {
        this.setPendingPhone(formData.phone);
      })
    );
  }

  /**
   * Vérification OTP SMS (POST /api/auth/verify-otp/)
   */
  verifyOtp(code: string): Observable<VerifyOtpResponse> {
    const url = `${environment.apiUrl}/api/auth/verify-otp/`;
    const phone = this.getPendingPhone() || '';

    const payload: VerifyOtpRequest = {
      numero_telephone: phone,
      code: code.trim()
    };

    return this.http.post<VerifyOtpResponse>(url, payload).pipe(
      tap(res => {
        if (res.verified) {
          this.clearPendingPhone();
          if (res.access && res.refresh) {
            this.setTokens(res.access, res.refresh);
          }
          if (res.utilisateur) {
            this.setCurrentUserFromDjango(res.utilisateur);
          }
        }
      })
    );
  }

  /**
   * Connexion Client (POST /api/auth/login/)
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    const url = `${environment.apiUrl}/api/auth/login/`;
    return this.http.post<LoginResponse>(url, credentials).pipe(
      tap((response: LoginResponse) => {
        if (response.access && response.refresh) {
          this.setTokens(response.access, response.refresh);
        }
        if (response.utilisateur) {
          this.setCurrentUserFromDjango(response.utilisateur);
        }
      })
    );
  }

  /**
   * Connexion Google OAuth (POST /api/auth/google/)
   */
  loginWithGoogle(credentialToken: string): Observable<LoginResponse> {
    const url = `${environment.apiUrl}/api/auth/google/`;
    return this.http.post<LoginResponse>(url, { token: credentialToken }).pipe(
      tap((response: LoginResponse) => {
        if (response.access && response.refresh) {
          this.setTokens(response.access, response.refresh);
        }
        if (response.utilisateur) {
          this.setCurrentUserFromDjango(response.utilisateur);
        }
      })
    );
  }

  /**
   * Gestion et Stockage des Tokens JWT (localStorage)
   */
  setTokens(access: string, refresh: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, access);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refresh);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.ACTIVE_MODE_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return !!token && token.trim().length > 0;
  }

  /**
   * Vérifie l'authentification et déclenche la modal d'authentification contextuelle si l'utilisateur est un invité.
   * Renseigne 'true' si authentifié, 'false' sinon.
   */
  requireAuth(config: AuthModalConfig = {}): boolean {
    if (this.isAuthenticated()) {
      return true;
    }
    this.authModalService.openModal(config);
    return false;
  }

  setCurrentUserFromDjango(dUser: DjangoUser): void {
    const isLivreur = dUser.roles?.includes('LIVREUR') || dUser.mode_actif === 'LIVREUR' || dUser.driver_status != null;
    const activeMode = isLivreur ? 'LIVREUR' : (dUser.mode_actif || 'CLIENT');
    const roles = dUser.roles || ['CLIENT'];
    const mainRole = roles.find(r => r !== 'CLIENT') || 'CLIENT';

    const user: User = {
      id: dUser.id,
      email: dUser.email,
      phoneNumber: dUser.numero_telephone,
      firstName: dUser.prenom,
      lastName: dUser.nom,
      role: mainRole,
      roles: roles,
      activeMode: activeMode,
      availableModes: dUser.available_modes || ['CLIENT'],
      hasDriverProfile: dUser.has_driver_profile || isLivreur,
      proStatus: dUser.pro_status || 'NONE',
      merchantStatus: dUser.merchant_status || null,
      driverStatus: dUser.driver_status || null,
      etablissement: dUser.etablissement || null,
      profilLivreur: dUser.profil_livreur || null
    };
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    localStorage.setItem(this.ACTIVE_MODE_KEY, activeMode);
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * GET /api/users/me/modes/
   * Récupère les modes disponibles et le mode actif de l'utilisateur.
   */
  getModes(): Observable<any> {
    const url = `${environment.apiUrl}/api/users/me/modes/`;
    return this.http.get<any>(url).pipe(
      tap(res => {
        if (res && res.active_mode) {
          localStorage.setItem(this.ACTIVE_MODE_KEY, res.active_mode);
          const currentUser = this.getCurrentUser();
          if (currentUser) {
            currentUser.activeMode = res.active_mode;
            currentUser.availableModes = res.available_modes;
            currentUser.hasDriverProfile = res.can_switch_to_driver;
            localStorage.setItem(this.USER_KEY, JSON.stringify(currentUser));
          }
        }
      })
    );
  }

  /**
   * PATCH /api/users/me/mode/
   * Bascule le mode actif de l'utilisateur (CLIENT ↔ LIVREUR).
   */
  switchMode(mode: 'CLIENT' | 'LIVREUR'): Observable<any> {
    const url = `${environment.apiUrl}/api/users/me/mode/`;
    return this.http.patch<any>(url, { mode }).pipe(
      tap(res => {
        if (res && res.active_mode) {
          localStorage.setItem(this.ACTIVE_MODE_KEY, res.active_mode);
          const currentUser = this.getCurrentUser();
          if (currentUser) {
            currentUser.activeMode = res.active_mode;
            localStorage.setItem(this.USER_KEY, JSON.stringify(currentUser));
          }
        }
      })
    );
  }

  getActiveMode(): 'CLIENT' | 'LIVREUR' {
    const mode = localStorage.getItem(this.ACTIVE_MODE_KEY);
    return (mode === 'LIVREUR') ? 'LIVREUR' : 'CLIENT';
  }

  logout(): Observable<void> {
    this.clearTokens();
    this.clearPendingPhone();
    return new Observable(observer => {
      observer.next();
      observer.complete();
    });
  }
}

