import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CheckoutPayload, CommandeOrder } from '../models/orders';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly baseUrl = `${environment.apiUrl}/api/orders`;

  constructor(private http: HttpClient) {}

  checkout(payload: CheckoutPayload): Observable<CommandeOrder> {
    return this.http.post<CommandeOrder>(`${this.baseUrl}/checkout/`, payload);
  }

  getOrders(): Observable<CommandeOrder[]> {
    return this.http.get<CommandeOrder[]>(`${this.baseUrl}/`);
  }

  getOrderById(id: number | string): Observable<CommandeOrder> {
    return this.http.get<CommandeOrder>(`${this.baseUrl}/${id}/`);
  }
}
