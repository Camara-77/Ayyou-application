import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, BehaviorSubject, tap } from 'rxjs';
import { Livraison, ValidateQrPayload, ValidateCodePayload, LivreurProfile, LivreurDocument } from '../models/delivery';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl ? `${environment.apiUrl}/api/deliveries` : '/api/deliveries';

  /**
   * GET /api/deliveries/available/
   */
  getAvailableDeliveries(): Observable<Livraison[]> {
    return this.http.get<any>(`${this.baseUrl}/available/`).pipe(
      map(res => (Array.isArray(res) ? res : res?.results || []))
    );
  }

  /**
   * GET /api/deliveries/
   */
  getDeliveries(): Observable<Livraison[]> {
    return this.http.get<any>(`${this.baseUrl}/`).pipe(
      map(res => (Array.isArray(res) ? res : res?.results || []))
    );
  }

  /**
   * GET /api/deliveries/{id}/
   */
  getDeliveryById(id: number): Observable<Livraison> {
    return this.http.get<Livraison>(`${this.baseUrl}/${id}/`);
  }

  /**
   * POST /api/deliveries/{id}/accept/
   */
  acceptDelivery(id: number): Observable<Livraison> {
    return this.http.post<Livraison>(`${this.baseUrl}/${id}/accept/`, {});
  }

  /**
   * POST /api/deliveries/{id}/decline/
   */
  declineDelivery(id: number): Observable<Livraison> {
    return this.http.post<Livraison>(`${this.baseUrl}/${id}/decline/`, {});
  }

  /**
   * POST /api/deliveries/{id}/arrive-restaurant/
   */
  arriveRestaurant(id: number): Observable<Livraison> {
    return this.http.post<Livraison>(`${this.baseUrl}/${id}/arrive-restaurant/`, {});
  }

  /**
   * POST /api/deliveries/{id}/pickup/
   */
  pickupDelivery(id: number): Observable<Livraison> {
    return this.http.post<Livraison>(`${this.baseUrl}/${id}/pickup/`, {});
  }

  /**
   * GET /api/deliveries/stats/
   */
  getDriverStats(): Observable<{ courses_terminees: number; gain_total: string; distance_km: string | null; temps_connecte: string | null }> {
    return this.http.get<any>(`${this.baseUrl}/stats/`);
  }

  /**
   * POST /api/deliveries/validate-qr/
   */
  validateByQr(payload: ValidateQrPayload): Observable<Livraison> {
    return this.http.post<Livraison>(`${this.baseUrl}/validate-qr/`, payload);
  }

  /**
   * POST /api/deliveries/validate-code/
   */
  validateByCode(payload: ValidateCodePayload): Observable<Livraison> {
    return this.http.post<Livraison>(`${this.baseUrl}/validate-code/`, payload);
  }

  private driverProfileSubject = new BehaviorSubject<LivreurProfile | null>(null);
  public driverProfile$ = this.driverProfileSubject.asObservable();

  /**
   * GET /api/deliveries/profile/
   */
  getDriverProfile(): Observable<LivreurProfile> {
    return this.http.get<LivreurProfile>(`${this.baseUrl}/profile/`).pipe(
      tap(profile => this.driverProfileSubject.next(profile))
    );
  }

  /**
   * PATCH /api/deliveries/profile/
   */
  updateDriverProfile(data: Partial<LivreurProfile>): Observable<LivreurProfile> {
    return this.http.patch<LivreurProfile>(`${this.baseUrl}/profile/`, data).pipe(
      tap(profile => this.driverProfileSubject.next(profile))
    );
  }

  /**
   * POST /api/deliveries/profile/photo/
   */
  uploadDriverPhoto(file: File): Observable<{ photo_url: string }> {
    const formData = new FormData();
    formData.append('photo', file);
    return this.http.post<{ photo_url: string }>(`${this.baseUrl}/profile/photo/`, formData).pipe(
      tap(res => {
        const current = this.driverProfileSubject.value;
        if (current && res.photo_url) {
          const updated = { ...current, photo_avatar: res.photo_url, permis_conduire: res.photo_url };
          this.driverProfileSubject.next(updated);
        }
      })
    );
  }

  /**
   * PATCH /api/deliveries/profile/availability/
   */
  updateAvailability(est_disponible: boolean): Observable<LivreurProfile> {
    return this.http.patch<LivreurProfile>(`${this.baseUrl}/profile/availability/`, { est_disponible }).pipe(
      tap(profile => this.driverProfileSubject.next(profile))
    );
  }

  /**
   * GET /api/deliveries/profile/documents/
   */
  getDriverDocuments(): Observable<LivreurDocument[]> {
    return this.http.get<any>(`${this.baseUrl}/profile/documents/`).pipe(
      map(res => (Array.isArray(res) ? res : res?.results || []))
    );
  }
}
