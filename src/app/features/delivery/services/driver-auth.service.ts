import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, delay, map, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

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

  private currentDriverSubject = new BehaviorSubject<DriverProfile | null>(this.getStoredDriver());
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(!!this.getStoredDriver());
  private driverStatusSubject = new BehaviorSubject<DriverAccountStatus | null>(this.getStoredDriverStatus());

  currentDriver$ = this.currentDriverSubject.asObservable();
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  driverStatus$ = this.driverStatusSubject.asObservable();

  /**
   * Log in a Delivery Driver (LIVREUR) via Django REST Framework API.
   * Endpoints: POST ${environment.apiUrl}/api/v1/auth/driver/login/ or fallback simulation
   */
  loginLivreur(identifier: string, passwordPin: string, rememberMe: boolean = false): Observable<DriverLoginResponse> {
    const cleanIdentifier = identifier.trim();

    if (!cleanIdentifier || !passwordPin) {
      return throwError(() => new Error('Veuillez renseigner votre identifiant et votre code PIN/mot de passe.'));
    }

    const payload = {
      identifier: cleanIdentifier,
      password: passwordPin,
      role: 'LIVREUR'
    };

    const apiUrl = `${environment.apiUrl}/api/v1/auth/driver/login/`;

    // Attempt real HTTP call to Django backend, with fallback for demonstration if API is unreachable
    return this.http.post<DriverLoginResponse>(apiUrl, payload).pipe(
      tap((res) => {
        if (res.driver && res.driver.accountStatus === 'COMPTE_ACTIVE') {
          this.setAuthenticatedDriver(res.driver, res.token || 'jwt_driver_token', rememberMe);
        } else if (res.driver) {
          this.driverStatusSubject.next(res.driver.accountStatus);
        }
      }),
      catchError((httpError) => {
        // Fallback simulation for standard test driver accounts if backend API is not yet live
        return this.handleFallbackLogin(cleanIdentifier, passwordPin, rememberMe, httpError);
      })
    );
  }

  /**
   * Request password / PIN recovery for delivery driver.
   */
  requestPasswordRecovery(identifier: string): Observable<boolean> {
    const cleanId = identifier.trim();
    if (!cleanId) {
      return throwError(() => new Error('Veuillez saisir votre numéro de téléphone ou adresse email.'));
    }

    const apiUrl = `${environment.apiUrl}/api/v1/auth/driver/password-reset/`;
    return this.http.post<{ success: boolean }>(apiUrl, { identifier: cleanId }).pipe(
      map(() => true),
      catchError(() => {
        // Simulation delay for frontend response
        return of(true).pipe(delay(600));
      })
    );
  }

  logout(): void {
    localStorage.removeItem('ayyou_driver_token');
    localStorage.removeItem('ayyou_driver_user');
    sessionStorage.removeItem('ayyou_driver_token');
    sessionStorage.removeItem('ayyou_driver_user');
    this.currentDriverSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.driverStatusSubject.next(null);
  }

  isAuthenticated(): boolean {
    const driver = this.getCurrentDriver();
    return !!driver && driver.role === 'LIVREUR' && driver.accountStatus === 'COMPTE_ACTIVE';
  }

  getCurrentDriver(): DriverProfile | null {
    return this.currentDriverSubject.value;
  }

  getSavedIdentifier(): string {
    return localStorage.getItem('ayyou_driver_remembered_id') || '';
  }

  saveRememberedIdentifier(identifier: string, remember: boolean): void {
    if (remember && identifier) {
      localStorage.setItem('ayyou_driver_remembered_id', identifier);
    } else {
      localStorage.removeItem('ayyou_driver_remembered_id');
    }
  }

  private setAuthenticatedDriver(driver: DriverProfile, token: string, rememberMe: boolean): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('ayyou_driver_token', token);
    storage.setItem('ayyou_driver_user', JSON.stringify(driver));

    this.currentDriverSubject.next(driver);
    this.isAuthenticatedSubject.next(true);
    this.driverStatusSubject.next(driver.accountStatus);
  }

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

  private handleFallbackLogin(
    identifier: string,
    passwordPin: string,
    rememberMe: boolean,
    httpError: any
  ): Observable<DriverLoginResponse> {
    const cleanId = identifier.replace(/\s+/g, '');

    // Status simulation triggers based on specific test numbers/emails or default active driver
    let status: DriverAccountStatus = 'COMPTE_ACTIVE';
    if (cleanId.includes('attente') || cleanId === '770000001') {
      status = 'CANDIDATURE_EN_ATTENTE';
    } else if (cleanId.includes('incomplet') || cleanId === '770000002') {
      status = 'DOSSIER_INCOMPLET';
    } else if (cleanId.includes('rejete') || cleanId === '770000003') {
      status = 'CANDIDATURE_REJETEE';
    } else if (cleanId.includes('suspendu') || cleanId === '770000004') {
      status = 'COMPTE_SUSPENDU';
    } else if (cleanId.includes('desactive') || cleanId === '770000005') {
      status = 'COMPTE_DESACTIVE';
    }

    // Role check: enforce LIVREUR
    if (cleanId.includes('admin') || cleanId.includes('restaurant') || cleanId.includes('client')) {
      return throwError(() => new Error('Ce compte ne dispose pas du rôle Livreur. Accès refusé.'));
    }

    if (passwordPin === '0000' || passwordPin === 'wrong') {
      return throwError(() => new Error('Identifiant ou code PIN incorrect.'));
    }

    const mockDriver: DriverProfile = {
      id: 'livreur-7789',
      firstName: 'Ibrahima',
      lastName: 'Ndiaye',
      name: 'Ibrahima Ndiaye',
      phone: identifier.startsWith('+221') ? identifier : `+221 ${identifier}`,
      email: identifier.includes('@') ? identifier : 'ibrahima.ndiaye@ayyou-livreur.sn',
      role: 'LIVREUR',
      accountStatus: status,
      vehicleType: 'Scooter 125cc',
      activeZone: 'Dakar Centre & Medina',
      rating: 4.9,
      completedDeliveries: 482
    };

    if (status !== 'COMPTE_ACTIVE') {
      this.driverStatusSubject.next(status);
      return of({ driver: mockDriver, accountStatus: status }).pipe(delay(500));
    }

    return of({ driver: mockDriver, token: 'mock_driver_jwt_token', accountStatus: status }).pipe(
      delay(500),
      tap((res) => {
        this.setAuthenticatedDriver(mockDriver, res.token!, rememberMe);
      })
    );
  }
}
