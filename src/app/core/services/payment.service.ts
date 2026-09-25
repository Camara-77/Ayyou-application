import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Payment,
  Invoice,
  CreatePaymentPayload,
  ConfirmPaymentPayload,
  InitiatePaydunyaPayload,
  InitiatePaydunyaResponse,
  InitiatePayTechPayload,
  InitiatePayTechResponse,
  PaymentStatusCheckResponse
} from '../models/payment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly baseUrl = `${environment.apiUrl}/api/payments`;

  constructor(private http: HttpClient) {}

  /**
   * Initialise une session de paiement sécurisée PayTech (Wave, Orange Money, Carte).
   * POST /api/payments/paytech/initiate/
   */
  initiatePayTechPayment(payload: InitiatePayTechPayload): Observable<InitiatePayTechResponse> {
    return this.http.post<InitiatePayTechResponse>(`${this.baseUrl}/paytech/initiate/`, payload);
  }

  /**
   * Initialise une session de paiement sécurisée PayDunya (Wave, Orange Money, Carte).
   * POST /api/payments/initiate/
   * Remarque : Le montant n'est JAMAIS fourni par le client frontend ; Django le calcule depuis la commande en BD.
   */
  initiatePaydunyaPayment(payload: InitiatePaydunyaPayload): Observable<InitiatePaydunyaResponse> {
    return this.http.post<InitiatePaydunyaResponse>(`${this.baseUrl}/initiate/`, payload);
  }


  /**
   * Vérifie le statut réel du paiement depuis le backend Django (avec synchronisation PayDunya si besoin).
   * GET /api/payments/transactions/{id}/status/
   */
  getPaymentStatus(id: number | string): Observable<PaymentStatusCheckResponse> {
    return this.http.get<PaymentStatusCheckResponse>(`${this.baseUrl}/transactions/${id}/status/`);
  }

  initiatePayment(payload: CreatePaymentPayload): Observable<Payment> {
    return this.http.post<Payment>(`${this.baseUrl}/transactions/`, payload);
  }

  getPayments(): Observable<Payment[]> {
    return this.http.get<any>(`${this.baseUrl}/transactions/`).pipe(
      map(res => Array.isArray(res) ? res : (res?.results || []))
    );
  }

  getPaymentById(id: number | string): Observable<Payment> {
    return this.http.get<Payment>(`${this.baseUrl}/transactions/${id}/`);
  }

  confirmPayment(id: number | string, payload?: ConfirmPaymentPayload): Observable<Payment> {
    return this.http.post<Payment>(`${this.baseUrl}/transactions/${id}/confirmer/`, payload || {});
  }

  failPayment(id: number | string): Observable<Payment> {
    return this.http.post<Payment>(`${this.baseUrl}/transactions/${id}/echouer/`, {});
  }

  cancelPayment(id: number | string): Observable<Payment> {
    return this.http.post<Payment>(`${this.baseUrl}/transactions/${id}/annuler/`, {});
  }

  getInvoices(): Observable<Invoice[]> {
    return this.http.get<any>(`${this.baseUrl}/invoices/`).pipe(
      map(res => Array.isArray(res) ? res : (res?.results || []))
    );
  }

  getInvoiceById(id: number | string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.baseUrl}/invoices/${id}/`);
  }

  downloadInvoicePdf(invoiceId: number | string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/invoices/${invoiceId}/pdf/`, {
      responseType: 'blob'
    });
  }
}
