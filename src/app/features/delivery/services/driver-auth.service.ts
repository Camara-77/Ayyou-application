import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, delay, map, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';

export type DriverAccountStatus =
  | 'CANDIDATURE_EN_ATTENTE'
  | 'DOSSIER_INCOMPLET'
  | 'CANDIDATURE_REJETEE'
  | 'COMPTE_ACTIVE'
  | 'COMPTE_SUSPENDU'
  | 'COMPTE_DESACTIVE';

export interface DriverProfile {
  id: string | number;
  firstName: string;
  lastName: string;
  name?: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  role: 'LIVREUR';
  accountStatus: DriverAccountStatus;
  vehicleType?: string;
  activeZone?: string;
  rating?: number;
  completedDeliveries?: number;
}

export interface DriverLoginResponse {
  token?: string;
  refresh?: string;
  driver?: DriverProfile;
  accountStatus?: DriverAccountStatus;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DriverAuthService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private currentDriverSubject = new BehaviorSubject<DriverProfile | null>(this.getStoredDriver());
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(!!this.getStoredDriver());
  private driverStatusSubject = new BehaviorSubject<DriverAccountStatus | null>(this.getStoredDriverStatus());

  currentDriver$ = this.currentDriverSubject.asObservable();
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  driverStatus$ = this.driverStatusSubject.asObservable();

  private getStoredDriver(): DriverProfile | null {
    try {
      const stored = localStorage.getItem('ayyou_driver_user') || sessionStorage.getItem('ayyou_driver_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private getStoredDriverStatus(): DriverAccountStatus | null {
    const driver = this.getStoredDriver();
    return driver ? driver.accountStatus : null;
  }

  getSavedIdentifier(): string {
    return localStorage.getItem('ayyou_saved_driver_id') || '';
  }

  saveRememberedIdentifier(identifier: string, rememberMe: boolean): void {
    if (rememberMe && identifier) {
      localStorage.setItem('ayyou_saved_driver_id', identifier);
    } else {
      localStorage.removeItem('ayyou_saved_driver_id');
    }
  }

  setAuthenticatedDriver(driver: DriverProfile, token?: string, rememberMe: boolean = true): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('ayyou_driver_user', JSON.stringify(driver));
    if (token) {
      storage.setItem('ayyou_access_token', token);
    }
    this.currentDriverSubject.next(driver);
    this.isAuthenticatedSubject.next(true);
    this.driverStatusSubject.next(driver.accountStatus);
  }

  loginLivreur(identifier: string, passwordPin: string, rememberMe: boolean = false): Observable<DriverLoginResponse> {
    return this.authService.login({ identifier: identifier, password: passwordPin }).pipe(
      map(res => {
        const user = res.utilisateur;
        const driverProfile: DriverProfile = {
          id: user?.id || '',
          firstName: user?.prenom || '',
          lastName: user?.nom || '',
          name: `${user?.prenom || ''} ${user?.nom || ''}`.trim(),
          phone: user?.numero_telephone || identifier,
          email: user?.email || '',
          role: 'LIVREUR',
          accountStatus: 'COMPTE_ACTIVE',
          vehicleType: (user as any)?.driverProfile?.vehicleType || 'MOTO',
          activeZone: (user as any)?.driverProfile?.activeZone || 'Dakar'
        };

        this.setAuthenticatedDriver(driverProfile, res.access, rememberMe);

        return {
          token: res.access,
          refresh: res.refresh,
          driver: driverProfile,
          accountStatus: 'COMPTE_ACTIVE' as DriverAccountStatus
        };
      }),
      catchError(err => {
        return throwError(() => new Error(err?.error?.detail || err?.error?.message || 'Identifiant ou code PIN incorrect.'));
      })
    );
  }

  requestPasswordRecovery(identifier: string): Observable<any> {
    const url = `${environment.apiUrl}/api/accounts/password-reset/`;
    return this.http.post(url, { identifier }).pipe(
      catchError(() => {
        return of({ success: true, message: 'Si le compte existe, un message de réinitialisation a été envoyé.' });
      })
    );
  }

  logout(): void {
    localStorage.removeItem('ayyou_driver_user');
    sessionStorage.removeItem('ayyou_driver_user');
    this.authService.logout();
    this.currentDriverSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.driverStatusSubject.next(null);
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value || this.authService.isAuthenticated();
  }

  getCurrentDriver(): DriverProfile | null {
    return this.currentDriverSubject.value;
  }
}
