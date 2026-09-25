import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { BackendAddress } from '../models/orders';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private readonly baseUrl = `${environment.apiUrl}/api/orders/addresses`;

  constructor(private http: HttpClient) {}

  getAddresses(): Observable<BackendAddress[]> {
    return this.http.get<BackendAddress[]>(`${this.baseUrl}/`).pipe(
      catchError(() => of([]))
    );
  }

  createAddress(address: Partial<BackendAddress>): Observable<BackendAddress> {
    return this.http.post<BackendAddress>(`${this.baseUrl}/`, address);
  }

  getAddressById(id: number | string): Observable<BackendAddress> {
    return this.http.get<BackendAddress>(`${this.baseUrl}/${id}/`);
  }

  updateAddress(id: number | string, data: Partial<BackendAddress>): Observable<BackendAddress> {
    return this.http.patch<BackendAddress>(`${this.baseUrl}/${id}/`, data);
  }

  deleteAddress(id: number | string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}/`);
  }

  setDefaultAddress(id: number | string): Observable<BackendAddress> {
    return this.http.post<BackendAddress>(`${this.baseUrl}/${id}/set-default/`, {});
  }
}
