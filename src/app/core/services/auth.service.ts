import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { LoginRequest, LoginResponse, User } from '../models/auth';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  login(request: LoginRequest): Observable<LoginResponse> {
    const url = `${environment.apiUrl}/api/auth/login/`;
    // Prepared for Django REST Framework backend
    return of({});
  }

  loginWithGoogle(credentialToken: string): Observable<LoginResponse> {
    const url = `${environment.apiUrl}/api/auth/google/`;
    // Prepared for Django DRF Google Auth endpoint
    return of({
      token: 'mock_jwt_token',
      user: {
        id: 1,
        email: 'user@example.com',
        firstName: 'Utilisateur',
        lastName: 'AYYOU'
      }
    });
  }

  logout(): Observable<void> {
    return of(undefined);
  }

  isAuthenticated(): boolean {
    return false;
  }

  getCurrentUser(): User | null {
    return null;
  }
}
