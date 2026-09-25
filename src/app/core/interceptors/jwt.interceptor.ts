import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  let token = authService.getAccessToken();

  if (!token) {
    const driverToken = localStorage.getItem('ayyou_driver_token') || sessionStorage.getItem('ayyou_driver_token');
    if (driverToken && driverToken.startsWith('ey')) {
      token = driverToken;
    }
  }

  // Ne pas injecter de token sur les routes publiques d'authentification et d'inscription PRO
  const isPublicAuthRoute = req.url.includes('/api/pro/register/') ||
                            req.url.includes('/api/auth/login/') ||
                            req.url.includes('/api/auth/register/');

  // Injecter le token Bearer pour les requêtes vers l'API AYYOU si le token est un vrai JWT
  const isApiUrl = environment.apiUrl && req.url.startsWith(environment.apiUrl);
  const isValidJwt = token && token.trim().length > 0 && !token.includes('mock_') && !token.includes('jwt_driver_token');

  if (!isPublicAuthRoute && isValidJwt && (isApiUrl || req.url.startsWith('/api/'))) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si le serveur retourne 401 car le token appartient à un compte utilisateur nettoyé/supprimé ou expiré
      if (error.status === 401) {
        const detail = error.error?.detail || error.error?.message || '';
        if (typeof detail === 'string' && (detail.includes("n'a pas été trouvé") || detail.includes('not found') || detail.includes('invalid') || detail.includes('expired'))) {
          console.warn('Nettoyage des tokens obsolètes suite au rejet 401...');
          authService.clearTokens();
        }
      }
      return throwError(() => error);
    })
  );
};
