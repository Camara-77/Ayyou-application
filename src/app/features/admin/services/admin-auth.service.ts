import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { SystemRoleType } from '../models/admin-settings.models';

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
  private currentAdminSubject = new BehaviorSubject<AdminProfile | null>(this.getStoredAdmin());
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(!!this.getStoredAdmin());
  private twoFactorRequiredSubject = new BehaviorSubject<boolean>(false);

  currentAdmin$ = this.currentAdminSubject.asObservable();
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  twoFactorRequired$ = this.twoFactorRequiredSubject.asObservable();

  constructor() {}

  login(email: string, password: string, rememberDevice: boolean = false): Observable<{ requires2FA: boolean; admin?: AdminProfile }> {
    const trimmedEmail = email.trim().toLowerCase();

    // Basic domain check for demo (@ayyou.sn or standard email)
    if (!trimmedEmail || !password) {
      return throwError(() => new Error('Veuillez renseigner votre email et mot de passe.'));
    }

    // Default mock admin profile
    const mockAdmin: AdminProfile = {
      id: 'admin-001',
      firstName: 'Mamadou',
      lastName: 'Diallo',
      name: 'Mamadou Diallo',
      email: trimmedEmail,
      role: 'Super Administrateur',
      scope: 'Accès Total (Tous modules & finances)'
    };

    // Simulate 2FA required for Super Admins
    const requires2FA = true;

    return of({ requires2FA, admin: mockAdmin }).pipe(
      delay(600),
      tap(res => {
        if (!res.requires2FA) {
          this.setAuthenticatedAdmin(mockAdmin, rememberDevice);
        } else {
          this.twoFactorRequiredSubject.next(true);
        }
      })
    );
  }

  verifyTwoFactor(code: string, rememberDevice: boolean = false): Observable<boolean> {
    if (!code || code.length < 6) {
      return throwError(() => new Error('Code 2FA invalide. Saisissez les 6 chiffres TOTP.'));
    }

    const mockAdmin: AdminProfile = {
      id: 'admin-001',
      firstName: 'Mamadou',
      lastName: 'Diallo',
      name: 'Mamadou Diallo',
      email: 'mamadou.d@ayyou.sn',
      role: 'Super Administrateur',
      scope: 'Accès Total (Tous modules & finances)'
    };

    return of(true).pipe(
      delay(500),
      tap(() => {
        this.twoFactorRequiredSubject.next(false);
        this.setAuthenticatedAdmin(mockAdmin, rememberDevice);
      })
    );
  }

  loginWithGoogle(): Observable<boolean> {
    const mockAdmin: AdminProfile = {
      id: 'admin-google',
      firstName: 'Mamadou',
      lastName: 'Diallo',
      name: 'Mamadou Diallo',
      email: 'mamadou.d@ayyou.sn',
      role: 'Super Administrateur',
      scope: 'Accès Total (Google Workspace SSO)'
    };

    return of(true).pipe(
      delay(800),
      tap(() => {
        this.setAuthenticatedAdmin(mockAdmin, true);
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
    this.currentAdminSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.twoFactorRequiredSubject.next(false);
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
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
