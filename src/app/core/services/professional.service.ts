import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProfessionalProfile, ProDish, ProOrder, ProVideoUpload, ProStats } from '../models/pro';

export interface BackendEtablissement {
  id: number;
  nom: string;
  type_etablissement: 'RESTAURANT' | 'VENDEUR';
  logo_url?: string;
  couverture_url?: string;
  slogan?: string;
  description?: string;
  adresse: string;
  latitude?: string | number | null;
  longitude?: string | number | null;
  note_moyenne?: string | number;
  nombre_avis?: number;
  statut: 'open' | 'closed';
  heure_fermeture?: string;
  telephone?: string;
  specialite?: string;
  nombre_videos?: number;
  est_verifie?: boolean;
  statut_verification?: string;
}

export interface BackendCategorie {
  id: number;
  slug: string;
  nom: string;
  icone?: string;
  image_url?: string;
  est_active: boolean;
  ordre: number;
}

export interface BackendProduit {
  id: number;
  etablissement: number;
  etablissement_nom?: string;
  categorie?: number;
  categorie_nom?: string;
  nom: string;
  description: string;
  prix_base: string | number;
  image_url: string;
  images_galerie?: string[];
  est_disponible: boolean;
  stock_disponible?: number;
  stock_ayyou_reserve?: number;
  temps_preparation?: string;
  nombre_likes?: number;
  tags?: string[];
  variantes?: any[];
  options?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ProfessionalService {
  private http = inject(HttpClient);
  private catalogApiUrl = environment.apiUrl ? `${environment.apiUrl}/api/catalog` : '/api/catalog';
  private proMerchantApiUrl = environment.apiUrl ? `${environment.apiUrl}/api/pro/merchant` : '/api/pro/merchant';
  private ordersApiUrl = environment.apiUrl ? `${environment.apiUrl}/api/orders` : '/api/orders';

  private handleApiError<T>(err: any, fallbackData: T): Observable<T> {
    return of(fallbackData);
  }

  /**
   * GET /api/pro/merchant/profile/
   * Récupère le profil de l'établissement du professionnel connecté.
   */
  getMyEstablishment(): Observable<BackendEtablissement> {
    return this.http.get<BackendEtablissement>(`${this.proMerchantApiUrl}/profile/`);
  }

  /**
   * PATCH /api/pro/merchant/profile/
   * Mise à jour du profil ou du statut (ouvert/fermé) de l'établissement.
   */
  updateEstablishment(id: number, data: Partial<BackendEtablissement>): Observable<BackendEtablissement> {
    return this.http.patch<BackendEtablissement>(`${this.proMerchantApiUrl}/profile/`, data);
  }

  /**
   * GET /api/catalog/categories/
   */
  getCategories(): Observable<BackendCategorie[]> {
    return this.http.get<any>(`${this.catalogApiUrl}/categories/`).pipe(
      map(res => (Array.isArray(res) ? res : res?.results || [])),
      catchError(() => of([]))
    );
  }

  /**
   * GET /api/pro/merchant/products/ ou GET /api/catalog/products/?etablissement={id}
   * Liste sécurisée des produits appartenant à l'établissement du professionnel.
   */
  getProducts(etabId?: number): Observable<BackendProduit[]> {
    let url = `${this.proMerchantApiUrl}/products/`;
    if (etabId) {
      url += `?etablissement=${etabId}`;
    }
    return this.http.get<any>(url).pipe(
      map(res => (Array.isArray(res) ? res : res?.results || [])),
      catchError(err => {
        if (etabId) {
          return this.http.get<any>(`${this.catalogApiUrl}/products/?etablissement=${etabId}`).pipe(
            map(res => (Array.isArray(res) ? res : res?.results || [])),
            catchError(() => of([]))
          );
        }
        return of([]);
      })
    );
  }

  /**
   * GET /api/pro/merchant/products/{id}/
   */
  getProductById(id: number): Observable<BackendProduit> {
    return this.http.get<BackendProduit>(`${this.proMerchantApiUrl}/products/${id}/`);
  }

  /**
   * POST /api/pro/merchant/products/ ou PUT /api/pro/merchant/products/{id}/
   */
  saveProduct(productData: Partial<BackendProduit>): Observable<BackendProduit> {
    if (productData.id) {
      return this.http.patch<BackendProduit>(`${this.proMerchantApiUrl}/products/${productData.id}/`, productData);
    } else {
      return this.http.post<BackendProduit>(`${this.proMerchantApiUrl}/products/`, productData);
    }
  }

  /**
   * PATCH /api/pro/merchant/products/{id}/toggle-disponibilite/
   */
  toggleProductDisponibilite(id: number): Observable<any> {
    return this.http.patch<any>(`${this.proMerchantApiUrl}/products/${id}/toggle-disponibilite/`, {}).pipe(
      catchError(err => this.handleApiError(err, { id, est_disponible: false }))
    );
  }

  /**
   * DELETE /api/pro/merchant/products/{id}/
   */
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.proMerchantApiUrl}/products/${id}/`).pipe(
      catchError(err => this.handleApiError(err, undefined as any))
    );
  }

  /**
   * GET /api/pro/merchant/stats/
   * Calcul des indicateurs KPI du Dashboard professionnel.
   */
  getMerchantStats(): Observable<any> {
    return this.http.get<any>(`${this.proMerchantApiUrl}/stats/`).pipe(
      catchError(err => of(null))
    );
  }

  /**
   * GET /api/pro/merchant/orders/
   */
  getVendorOrders(): Observable<any[]> {
    return this.http.get<any>(`${this.proMerchantApiUrl}/orders/`).pipe(
      map(res => (Array.isArray(res) ? res : res?.results || [])),
      catchError(err => this.handleApiError(err, []))
    );
  }

  /**
   * GET /api/catalog/feed/?etablissement={id}
   */
  getFeedPublications(etabId?: number): Observable<any[]> {
    let url = `${this.catalogApiUrl}/feed/`;
    if (etabId) {
      url += `?etablissement=${etabId}`;
    }
    return this.http.get<any>(url).pipe(
      map(res => (Array.isArray(res) ? res : res?.results || [])),
      catchError(err => this.handleApiError(err, []))
    );
  }

  /**
   * POST /api/pro/merchant/upload-image/
   * Téléverse une photo de plat vers Cloudinary et renvoie l'URL HTTPS finale.
   */
  uploadProductImage(file: File): Observable<{ image_url: string; cloudinary_public_id: string }> {
    const formData = new FormData();
    formData.append('image_file', file);
    return this.http.post<{ image_url: string; cloudinary_public_id: string }>(
      `${this.proMerchantApiUrl}/upload-image/`,
      formData
    );
  }

  /**
   * POST /api/catalog/feed/
   * Téléverse une vidéo vers Cloudinary et enregistre la publication Feed.
   */
  uploadVideoFeed(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.catalogApiUrl}/feed/`, formData);
  }


  /**
   * DELETE /api/catalog/feed/{id}/
   */
  deleteFeedPublication(id: number): Observable<void> {
    return this.http.delete<void>(`${this.catalogApiUrl}/feed/${id}/`).pipe(
      catchError(err => this.handleApiError(err, undefined as any))
    );
  }

  /**
   * Helper mapping BackendEtablissement -> ProfessionalProfile UI model
   */
  mapEtablissementToProfile(etab: BackendEtablissement): ProfessionalProfile {
    return {
      id: etab.id.toString(),
      type: etab.type_etablissement,
      name: etab.nom,
      avatarUrl: etab.logo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      logoUrl: etab.logo_url,
      coverUrl: etab.couverture_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
      tagline: etab.slogan || 'Plateforme AYYOU Pro',
      description: etab.description || '',
      location: etab.adresse,
      address: etab.adresse,
      phone: etab.telephone || '+221 33 821 00 00',
      status: etab.statut,
      isOpen: etab.statut === 'open',
      closingTime: etab.heure_fermeture || '23h30',
      cuisineTypes: etab.specialite ? [etab.specialite] : ['Cuisine Sénégalaise'],
      openingHours: '11h30 - 23h30'
    };
  }
}
