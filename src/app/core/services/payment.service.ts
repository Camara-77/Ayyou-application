import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  PaymentStatusCheckResponse,
  SubscriptionStatusResponse,
  AbonnementPro,
  InitiateSubscriptionResponse
} from '../models/payment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly baseUrl = `${environment.apiUrl}/api/payments`;

  constructor(private http: HttpClient) {}

  /**
   * Initialise une session de paiement d'abonnement PRO (10 000 FCFA / mois) via PayTech.
   * POST /api/payments/subscription/initiate/
   */
  initiateSubscriptionPayment(etablissement_id?: number, return_url?: string, cancel_url?: string): Observable<InitiateSubscriptionResponse> {
    const payload: any = {};
    if (etablissement_id) payload.etablissement_id = etablissement_id;
    if (return_url) payload.return_url = return_url;
    if (cancel_url) payload.cancel_url = cancel_url;
    return this.http.post<InitiateSubscriptionResponse>(`${this.baseUrl}/subscription/initiate/`, payload);
  }

  /**
   * Récupère le statut courant de l'abonnement PRO de l'établissement.
   * GET /api/payments/subscription/status/
   */
  getSubscriptionStatus(etablissement_id?: number): Observable<SubscriptionStatusResponse> {
    let params = new HttpParams();
    if (etablissement_id) params = params.set('etablissement_id', etablissement_id.toString());
    return this.http.get<SubscriptionStatusResponse>(`${this.baseUrl}/subscription/status/`, { params });
  }

  /**
   * Récupère l'historique des cycles d'abonnement et factures PRO associées.
   * GET /api/payments/subscription/history/
   */
  getSubscriptionHistory(etablissement_id?: number): Observable<AbonnementPro[]> {
    let params = new HttpParams();
    if (etablissement_id) params = params.set('etablissement_id', etablissement_id.toString());
    return this.http.get<AbonnementPro[]>(`${this.baseUrl}/subscription/history/`, { params });
  }

  /**
   * Télécharge le PDF d'une facture d'abonnement PRO.
   * GET /api/payments/subscription/invoices/{id}/pdf/
   */
  downloadSubscriptionInvoicePdf(invoiceId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/subscription/invoices/${invoiceId}/pdf/`, {
      responseType: 'blob'
    });
  }

  /**
   * Initialise une session de paiement sécurisée PayTech (Wave, Orange Money, Carte).
   * POST /api/payments/paytech/initiate/
   */
  initiatePayTechPayment(payload: InitiatePayTechPayload): Observable<InitiatePayTechResponse> {
    return this.http.post<InitiatePayTechResponse>(`${this.baseUrl}/paytech/initiate/`, payload);
  }

  /**
   * Confirmation de secours pour PayTech en développement local ou IPN manqué.
   * POST /api/payments/paytech/confirm-fallback/
   */
  confirmPayTechFallback(payload: { order_id?: string | number; reference?: string; token?: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/paytech/confirm-fallback/`, payload);
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

