import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface RestaurantRegisterPayload {
  email: string;
  numero_telephone: string;
  password: string;
  password_confirm: string;
  prenom: string;
  nom: string;
  nom_etablissement: string;
  adresse: string;
  slogan?: string;
  specialite?: string;
  telephone_etablissement?: string;
}

export interface VendeurRegisterPayload {
  email: string;
  numero_telephone: string;
  password: string;
  password_confirm: string;
  prenom: string;
  nom: string;
  nom_etablissement: string;
  adresse: string;
  slogan?: string;
  specialite?: string;
  telephone_etablissement?: string;
}

export interface LivreurRegisterPayload {
  email: string;
  numero_telephone: string;
  password: string;
  password_confirm: string;
  prenom: string;
  nom: string;
  type_vehicule?: 'MOTO' | 'VOITURE' | 'VELO' | 'AUTRE';
  marque?: string;
  modele?: string;
  immatriculation?: string;
}

export interface RegisterProResponse {
  message: string;
  user_id: number;
  etablissement_id?: number;
  profil_livreur_id?: number;
  type_etablissement?: string;
  statut_verification: 'EN_ATTENTE' | 'VALIDE' | 'REFUSE';
}

@Injectable({
  providedIn: 'root'
})
export class ProRegisterService {
  private http = inject(HttpClient);

  registerRestaurant(payload: FormData | RestaurantRegisterPayload): Observable<RegisterProResponse> {
    const url = `${environment.apiUrl}/api/pro/register/restaurant/`;
    return this.http.post<RegisterProResponse>(url, payload).pipe(
      catchError(err => this.handleError(err))
    );
  }

  registerVendeur(payload: FormData | VendeurRegisterPayload): Observable<RegisterProResponse> {
    const url = `${environment.apiUrl}/api/pro/register/vendeur/`;
    return this.http.post<RegisterProResponse>(url, payload).pipe(
      catchError(err => this.handleError(err))
    );
  }

  registerLivreur(payload: FormData | LivreurRegisterPayload): Observable<RegisterProResponse> {
    const url = `${environment.apiUrl}/api/pro/register/livreur/`;
    return this.http.post<RegisterProResponse>(url, payload).pipe(
      catchError(err => this.handleError(err))
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.';

    if (error.error) {
      if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (typeof error.error.detail === 'string') {
        errorMessage = error.error.detail;
      } else if (typeof error.error.message === 'string') {
        errorMessage = error.error.message;
      } else if (typeof error.error === 'object') {
        const messages: string[] = [];
        for (const key of Object.keys(error.error)) {
          const val = error.error[key];
          if (Array.isArray(val)) {
            messages.push(`${key}: ${val.join(' ')}`);
          } else if (typeof val === 'string') {
            messages.push(`${key}: ${val}`);
          }
        }
        if (messages.length > 0) {
          errorMessage = messages.join(' | ');
        }
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
