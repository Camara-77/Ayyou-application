import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, delay, map, tap } from 'rxjs/operators';
import { SystemRoleType } from '../models/admin-settings.models';
import { environment } from '../../../../environments/environment';

export interface AdminProfile {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  role: SystemRoleType;
  scope: string;
  avatarUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private http = inject(HttpClient);

  private currentAdminSubject = new BehaviorSubject<AdminProfile | null>(this.getStoredAdmin());
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(!!this.getStoredAdmin());
  private twoFactorRequiredSubject = new BehaviorSubject<boolean>(false);

  currentAdmin$ = this.currentAdminSubject.asObservable();
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  twoFactorRequired$ = this.twoFactorRequiredSubject.asObservable();

  constructor() {}

  login(email: string, password: string, rememberDevice: boolean = false): Observable<{ requires2FA: boolean; admin?: AdminProfile }> {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      return throwError(() => new Error('Veuillez renseigner votre email et mot de passe.'));
    }

    const url = `${environment.apiUrl}/api/auth/login/`;
    const payload = {
      identifier: trimmedEmail,
      password: password
    };

    return this.http.post<any>(url, payload).pipe(
      map(res => {
        if (!res || !res.access) {
          throw new Error('Identifiants invalides ou jeton d\'accès manquant.');
        }

        // Store tokens for JWT interceptor and session management
        localStorage.setItem('ayyou_access_token', res.access);
        if (res.refresh) {
          localStorage.setItem('ayyou_refresh_token', res.refresh);
        }
        localStorage.setItem('ayyou_admin_token', res.access);

        const u = res.utilisateur;
        const admin: AdminProfile = {
          id: u ? u.id.toString() : 'admin-001',
          firstName: u?.prenom || 'Super',
          lastName: u?.nom || 'Admin',
          name: u ? `${u.prenom} ${u.nom}`.trim() : 'Super Administrateur',
          email: u?.email || trimmedEmail,
          role: 'Super Administrateur',
          scope: 'Accès Total (API Backend Django)'
        };

        this.setAuthenticatedAdmin(admin, rememberDevice);
        return { requires2FA: false, admin };
      }),
      catchError(err => {
        let msg = 'Échec de la connexion. Vérifiez vos identifiants.';
        if (err.error) {
          if (typeof err.error.detail === 'string') {
            msg = err.error.detail;
          } else if (err.error.errors) {
            if (typeof err.error.errors.detail === 'string') {
              msg = err.error.errors.detail;
            } else if (typeof err.error.errors === 'string') {
              msg = err.error.errors;
            }
          }
        }
        return throwError(() => new Error(msg));
      })
    );
  }

  verifyTwoFactor(code: string, rememberDevice: boolean = false): Observable<boolean> {
    if (!code || code.length < 6) {
      return throwError(() => new Error('Code 2FA invalide. Saisissez les 6 chiffres TOTP.'));
    }

    const current = this.currentAdminSubject.value;
    const activeAdmin: AdminProfile = current || {
      id: 'admin-auth',
      firstName: 'Administrateur',
      lastName: 'AYYOU',
      name: 'Administrateur AYYOU',
      email: 'admin@ayyou.sn',
      role: 'Super Administrateur',
      scope: 'Accès Total (API Backend)'
    };

    return of(true).pipe(
      delay(500),
      tap(() => {
        this.twoFactorRequiredSubject.next(false);
        this.setAuthenticatedAdmin(activeAdmin, rememberDevice);
      })
    );
  }

  loginWithGoogle(): Observable<boolean> {
    const current = this.currentAdminSubject.value;
    const activeAdmin: AdminProfile = current || {
      id: 'admin-google',
      firstName: 'Administrateur',
      lastName: 'AYYOU',
      name: 'Administrateur AYYOU',
      email: 'admin@ayyou.sn',
      role: 'Super Administrateur',
      scope: 'Accès Total (Google Workspace SSO)'
    };

    return of(true).pipe(
      delay(800),
      tap(() => {
        this.setAuthenticatedAdmin(activeAdmin, true);
      })
    );
  }

  requestPasswordRecovery(email: string): Observable<boolean> {
    if (!email || !email.includes('@')) {
      return throwError(() => new Error('Veuillez saisir une adresse email valide.'));
    }
    return of(true).pipe(delay(600));
  }

  logout(): void {
    localStorage.removeItem('ayyou_admin_user');
    sessionStorage.removeItem('ayyou_admin_user');
    localStorage.removeItem('ayyou_admin_token');
    localStorage.removeItem('ayyou_access_token');
    localStorage.removeItem('ayyou_refresh_token');
    this.currentAdminSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.twoFactorRequiredSubject.next(false);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('ayyou_access_token') || localStorage.getItem('ayyou_admin_token');
    const storedUser = this.getStoredAdmin();
    return !!token && !!storedUser && this.isAuthenticatedSubject.value;
  }

  getCurrentAdmin(): AdminProfile | null {
    return this.currentAdminSubject.value;
  }

  private setAuthenticatedAdmin(admin: AdminProfile, rememberDevice: boolean): void {
    const storage = rememberDevice ? localStorage : sessionStorage;
    storage.setItem('ayyou_admin_user', JSON.stringify(admin));
    this.currentAdminSubject.next(admin);
    this.isAuthenticatedSubject.next(true);
  }

  private getStoredAdmin(): AdminProfile | null {
    try {
      const stored = localStorage.getItem('ayyou_admin_user') || sessionStorage.getItem('ayyou_admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
}
