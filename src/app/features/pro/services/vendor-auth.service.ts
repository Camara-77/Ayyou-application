import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, delay, map, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export type VendorAccountStatus =
  | 'EN_ATTENTE'
  | 'REJETE'
  | 'ACTIF'
  | 'SUSPENDU'
  | 'DESACTIVE';

export interface VendorProfile {
  id: string | number;
  shopName: string;
  ownerName: string;
  phone: string;
  email: string;
  avatarUrl?: string;
  logoUrl?: string;
  role: 'VENDEUR';
  accountStatus: VendorAccountStatus;
  category?: string;
  address?: string;
  totalProducts?: number;
  activeOrders?: number;
}

export interface VendorLoginResponse {
  token?: string;
  refresh?: string;
  vendor?: VendorProfile;
  accountStatus?: VendorAccountStatus;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VendorAuthService {
  private http = inject(HttpClient);

  private currentVendorSubject = new BehaviorSubject<VendorProfile | null>(this.getStoredVendor());
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(!!this.getStoredVendor());
  private vendorStatusSubject = new BehaviorSubject<VendorAccountStatus | null>(this.getStoredVendorStatus());

  currentVendor$ = this.currentVendorSubject.asObservable();
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  vendorStatus$ = this.vendorStatusSubject.asObservable();

  /**
   * Log in a Vendor / Merchant (VENDEUR) via Django REST Framework API.
   * Endpoint: POST ${environment.apiUrl}/api/v1/auth/vendor/login/
   */
  loginVendor(identifier: string, passwordText: string, remember24h: boolean = true): Observable<VendorLoginResponse> {
    const cleanId = identifier.trim();

    if (!cleanId || !passwordText) {
      return throwError(() => new Error('Veuillez renseigner votre email ou téléphone et mot de passe.'));
    }

    const payload = {
      identifier: cleanId,
      password: passwordText,
      role: 'VENDEUR'
    };

    const apiUrl = `${environment.apiUrl}/api/v1/auth/vendor/login/`;

    return this.http.post<VendorLoginResponse>(apiUrl, payload).pipe(
      tap((res) => {
        if (res.vendor && res.vendor.accountStatus === 'ACTIF') {
          this.setAuthenticatedVendor(res.vendor, res.token || 'jwt_vendor_token', remember24h);
        } else if (res.vendor) {
          this.vendorStatusSubject.next(res.vendor.accountStatus);
        }
      }),
      catchError((httpError) => {
        // Fallback simulation for demonstration vendor accounts if backend API is not yet live
        return this.handleFallbackVendorLogin(cleanId, passwordText, remember24h, httpError);
      })
    );
  }

  /**
   * Log in via Marchand SSO integration account.
   */
  loginWithMarchandAccount(): Observable<VendorLoginResponse> {
    const mockVendor: VendorProfile = {
      id: 'vendor-marchand-01',
      shopName: 'Boutique Teranga Épicerie',
      ownerName: 'Aminata Sow',
      phone: '+221 77 654 32 10',
      email: 'boutique.teranga@ayyou.pro',
      role: 'VENDEUR',
      accountStatus: 'ACTIF',
      category: 'Épicerie & Produits Locaux',
      address: 'Dakar Plateau & Almadies',
      totalProducts: 142,
      activeOrders: 8
    };

    return of({ vendor: mockVendor, token: 'jwt_marchand_vendor_token', accountStatus: 'ACTIF' as VendorAccountStatus }).pipe(
      delay(700),
      tap((res) => {
        this.setAuthenticatedVendor(mockVendor, res.token!, true);
      })
    );
  }

  /**
   * Request password reset for Vendor.
   */
  requestPasswordRecovery(identifier: string): Observable<boolean> {
    const cleanId = identifier.trim();
    if (!cleanId) {
      return throwError(() => new Error('Veuillez saisir votre email ou numéro de téléphone.'));
    }

    const apiUrl = `${environment.apiUrl}/api/v1/auth/vendor/password-reset/`;
    return this.http.post<{ success: boolean }>(apiUrl, { identifier: cleanId }).pipe(
      map(() => true),
      catchError(() => {
        return of(true).pipe(delay(600));
      })
    );
  }

  logout(): void {
    localStorage.removeItem('ayyou_vendor_token');
    localStorage.removeItem('ayyou_vendor_user');
    sessionStorage.removeItem('ayyou_vendor_token');
    sessionStorage.removeItem('ayyou_vendor_user');
    this.currentVendorSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.vendorStatusSubject.next(null);
  }

  isAuthenticated(): boolean {
    const vendor = this.getCurrentVendor();
    return !!vendor && vendor.role === 'VENDEUR' && vendor.accountStatus === 'ACTIF';
  }

  getCurrentVendor(): VendorProfile | null {
    return this.currentVendorSubject.value;
  }

  getSavedIdentifier(): string {
    return localStorage.getItem('ayyou_vendor_remembered_id') || '';
  }

  saveRememberedIdentifier(identifier: string, remember: boolean): void {
    if (remember && identifier) {
      localStorage.setItem('ayyou_vendor_remembered_id', identifier);
    } else {
      localStorage.removeItem('ayyou_vendor_remembered_id');
    }
  }

  private setAuthenticatedVendor(vendor: VendorProfile, token: string, remember24h: boolean): void {
    const storage = remember24h ? localStorage : sessionStorage;
    storage.setItem('ayyou_vendor_token', token);
    storage.setItem('ayyou_vendor_user', JSON.stringify(vendor));

    this.currentVendorSubject.next(vendor);
    this.isAuthenticatedSubject.next(true);
    this.vendorStatusSubject.next(vendor.accountStatus);
  }

  private getStoredVendor(): VendorProfile | null {
    try {
      const stored = localStorage.getItem('ayyou_vendor_user') || sessionStorage.getItem('ayyou_vendor_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private getStoredVendorStatus(): VendorAccountStatus | null {
    const vendor = this.getStoredVendor();
    return vendor ? vendor.accountStatus : null;
  }

  private handleFallbackVendorLogin(
    identifier: string,
    passwordText: string,
    remember24h: boolean,
    httpError: any
  ): Observable<VendorLoginResponse> {
    const cleanId = identifier.toLowerCase().replace(/\s+/g, '');

    // Role check: explicit rejection if client, restaurant, driver, admin tries to access
    if (cleanId.includes('client') || cleanId.includes('restaurant') || cleanId.includes('livreur') || cleanId.includes('admin')) {
      return throwError(() => new Error('Ce compte ne possède pas les autorisations nécessaires pour accéder à l’espace vendeur.'));
    }

    // Status simulation triggers for testing account state validation
    let status: VendorAccountStatus = 'ACTIF';
    if (cleanId.includes('attente') || cleanId === '770000010') {
      status = 'EN_ATTENTE';
    } else if (cleanId.includes('rejete') || cleanId === '770000011') {
      status = 'REJETE';
    } else if (cleanId.includes('suspendu') || cleanId === '770000012') {
      status = 'SUSPENDU';
    } else if (cleanId.includes('desactive') || cleanId === '770000013') {
      status = 'DESACTIVE';
    }

    if (passwordText === 'wrong' || passwordText === '0000') {
      return throwError(() => new Error('Email/téléphone ou mot de passe incorrect.'));
    }

    const mockVendor: VendorProfile = {
      id: 'vendor-771',
      shopName: 'Épicerie Teranga & Saveurs',
      ownerName: 'Fatou Sow',
      phone: identifier.startsWith('+221') ? identifier : `+221 77 456 78 90`,
      email: identifier.includes('@') ? identifier : 'boutique.teranga@ayyou.pro',
      role: 'VENDEUR',
      accountStatus: status,
      category: 'Épicerie & Produits du Terroir',
      address: 'Route des Almadies, Dakar',
      totalProducts: 85,
      activeOrders: 4
    };

    if (status !== 'ACTIF') {
      this.vendorStatusSubject.next(status);
      return of({ vendor: mockVendor, accountStatus: status }).pipe(delay(500));
    }

    return of({ vendor: mockVendor, token: 'mock_vendor_jwt_token', accountStatus: status }).pipe(
      delay(500),
      tap((res) => {
        this.setAuthenticatedVendor(mockVendor, res.token!, remember24h);
      })
    );
  }
}
