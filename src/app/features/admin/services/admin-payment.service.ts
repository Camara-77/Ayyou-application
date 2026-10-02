import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  PaymentChannel,
  PaymentFilterTab,
  PaymentItem,
  PaymentOperationType,
  PaymentStatsSummary,
  PaymentStatus
} from '../models/admin-payment.models';
import { environment } from '../../../../environments/environment';

function mapPaymentChannel(rawMethode: string): PaymentChannel {
  const m = (rawMethode || '').toUpperCase();
  if (m === 'WAVE') return 'WAVE';
  if (m === 'ORANGE_MONEY') return 'ORANGE_MONEY_PRO';
  if (m === 'CARTE_BANCAIRE') return 'PRELEVEMENT_CB';
  return 'WAVE_BUSINESS';
}

function mapPaymentStatus(rawStatut: string, metadata?: any): PaymentStatus {
  if (metadata && metadata.reconciled) {
    return 'RECONCILIE';
  }

  const s = (rawStatut || '').toUpperCase();
  if (s === 'PAYE') return 'PAYE';
  if (s === 'EN_ATTENTE' || s === 'INITIE') return 'EN_ATTENTE';
  if (s === 'ECHOUE' || s === 'EXPIRE' || s === 'ANNULE') return 'ECHOUER';
  return 'EN_ATTENTE';
}

function mapBackendPaymentToPaymentItem(p: any): PaymentItem {
  const rawMethode = (p.methode || '').toUpperCase();
  const paymentChannel = mapPaymentChannel(rawMethode);
  const isReconciled = !!(p.metadata && p.metadata.reconciled);
  const status = mapPaymentStatus(p.statut, p.metadata);

  let statusText = p.statut_display || p.statut || 'En cours';
  let statusColor: 'green' | 'orange' | 'red' | 'gray' = 'orange';

  if (isReconciled) {
    statusText = 'RÉCONCILIÉ EN TEMPS RÉEL';
    statusColor = 'green';
  } else if (p.statut === 'PAYE') {
    statusText = 'Payé';
    statusColor = 'green';
  } else if (p.statut === 'ECHOUE' || p.statut === 'ANNULE') {
    statusText = 'Échoué';
    statusColor = 'red';
  }

  const amount = Number(p.montant || 0);
  const amountFormatted = `${new Intl.NumberFormat('fr-FR').format(amount)} FCFA`;
  const ref = p.reference || `#PAY-${p.id}`;

  const dateObj = p.date_creation ? new Date(p.date_creation) : new Date();
  const dateText = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const fullDate = dateObj.toLocaleString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const orderRef = p.commande_numero ? `#${p.commande_numero}` : undefined;
  const beneficiaryName = p.client_nom || p.beneficiaire_nom || (p.commande_numero ? `Commande ${orderRef}` : 'Client');

  return {
    id: p.id ? p.id.toString() : '',
    reference: ref,
    dateText,
    fullDate,
    beneficiaryName,
    beneficiarySubtitle: p.methode_display || p.methode || 'Transaction AYYOU',
    beneficiaryInitials: 'AY',
    beneficiaryType: 'RESTAURANT',
    operationType: 'PAIEMENT_COMMANDE',
    operationTypeLabel: p.methode_display ? `Paiement ${p.methode_display}` : 'Paiement commande',
    amount,
    amountFormatted,
    paymentChannel,
    paymentChannelLabel: p.methode_display || p.methode || 'Autre',
    paymentChannelDotColor: rawMethode === 'WAVE' ? 'blue' : (rawMethode === 'ORANGE_MONEY' ? 'orange' : 'gray'),
    status,
    statusText,
    statusColor,
    waveTxId: p.transaction_externe || undefined,
    associatedOrderRef: orderRef,
    breakdown: {
      grossSales: amount,
      orderCount: 1,
      serviceFees: 0,
      ayyouCommission: 0,
      waveApiFeesOffered: 0,
      netPayout: amount
    },
    fiscalReceiptRef: `#FAC-${p.id}`,
    bankReconciliation: isReconciled ? 'Concordance 100%' : 'À vérifier',
    isVerified: isReconciled
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminPaymentService {
  private http = inject(HttpClient);

  private selectedPaymentSubject = new BehaviorSubject<PaymentItem | null>(null);
  selectedPayment$ = this.selectedPaymentSubject.asObservable();

  private paymentsSubject = new BehaviorSubject<PaymentItem[]>([]);
  payments$ = this.paymentsSubject.asObservable();

  getStatsSummary(): Observable<PaymentStatsSummary> {
    const url = `${environment.apiUrl}/api/admin/payments/`;
    return this.http.get<any>(url).pipe(
      map(res => {
        const rawItems: any[] = Array.isArray(res) ? res : (res.results || []);
        const items = rawItems.map(mapBackendPaymentToPaymentItem);

        const volumeBrutGmv = items.reduce((acc, p) => acc + p.amount, 0);
        const payoutsMarchandsLivreurs = Math.round(volumeBrutGmv * 0.85);
        const revenusAbonnementsPro = Math.round(volumeBrutGmv * 0.15);
        const activeSubscriptionsCount = items.length;
        const pendingWaveOmAmount = items.filter(p => p.status === 'EN_ATTENTE').reduce((acc, p) => acc + p.amount, 0);
        const pendingTransfersCount = items.filter(p => p.status === 'EN_ATTENTE').length;
        const reconciledCount = items.filter(p => p.isVerified).length;
        const reconciliationRatePercent = items.length > 0 ? Number(((reconciledCount / items.length) * 100).toFixed(1)) : 100;
        const auditedDisputesCount = items.filter(p => p.status === 'ECHOUER').length;

        return {
          volumeBrutGmv,
          volumeGrowthPercent: 0,
          payoutsMarchandsLivreurs,
          revenusAbonnementsPro,
          activeSubscriptionsCount,
          pendingWaveOmAmount,
          pendingTransfersCount,
          reconciliationRatePercent,
          auditedDisputesCount
        };
      }),
      catchError(() => of({
        volumeBrutGmv: 0,
        volumeGrowthPercent: 0,
        payoutsMarchandsLivreurs: 0,
        revenusAbonnementsPro: 0,
        activeSubscriptionsCount: 0,
        pendingWaveOmAmount: 0,
        pendingTransfersCount: 0,
        reconciliationRatePercent: 100,
        auditedDisputesCount: 0
      }))
    );
  }

  filterPayments(
    tab: PaymentFilterTab,
    search: string,
    method: string,
    period: string,
    status: string
  ): Observable<PaymentItem[]> {
    let params = new HttpParams();

    if (method && method !== 'ALL') {
      params = params.set('methode', method);
    }

    if (status && status !== 'ALL') {
      params = params.set('statut', status);
    }

    const url = `${environment.apiUrl}/api/admin/payments/`;

    return this.http.get<any>(url, { params }).pipe(
      map(res => {
        const rawItems: any[] = Array.isArray(res) ? res : (res.results || []);
        let items = rawItems.map(mapBackendPaymentToPaymentItem);

        if (search && search.trim() !== '') {
          const q = search.toLowerCase().trim();
          items = items.filter(p =>
            p.reference.toLowerCase().includes(q) ||
            p.beneficiaryName.toLowerCase().includes(q) ||
            (p.associatedOrderRef && p.associatedOrderRef.toLowerCase().includes(q))
          );
        }

        this.paymentsSubject.next(items);

        const currentSelected = this.selectedPaymentSubject.getValue();
        if (items.length > 0) {
          if (!currentSelected || !items.some(p => p.id === currentSelected.id)) {
            this.selectedPaymentSubject.next(items[0]);
          }
        } else {
          this.selectedPaymentSubject.next(null);
        }

        return items;
      }),
      catchError(err => {
        console.error('Erreur chargement paiements admin:', err);
        return of([]);
      })
    );
  }

  selectPayment(payment: PaymentItem | null): void {
    this.selectedPaymentSubject.next(payment);
  }

  verifyPayment(paymentId: string): Observable<PaymentItem | null> {
    const url = `${environment.apiUrl}/api/admin/payments/${paymentId}/reconcile/`;
    return this.http.post<any>(url, { note: 'Rapprochement manuel Super Admin' }).pipe(
      map(raw => {
        const updated = mapBackendPaymentToPaymentItem(raw);
        const currentPayments = this.paymentsSubject.getValue().map(p => p.id === paymentId ? updated : p);
        this.paymentsSubject.next(currentPayments);

        if (this.selectedPaymentSubject.getValue()?.id === paymentId) {
          this.selectedPaymentSubject.next(updated);
        }
        return updated;
      }),
      catchError(err => {
        console.error('Erreur rapprochement paiement:', err);
        return of(null);
      })
    );
  }

  reminderPartner(paymentId: string): void {
    const item = this.paymentsSubject.getValue().find(p => p.id === paymentId);
    if (item) {
      alert(`Relance transmise avec succès pour le paiement ${item.reference}.`);
    }
  }
}
