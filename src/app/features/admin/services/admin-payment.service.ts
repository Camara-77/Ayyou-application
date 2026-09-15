import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import {
  PaymentFilterTab,
  PaymentItem,
  PaymentStatsSummary
} from '../models/admin-payment.models';

@Injectable({
  providedIn: 'root'
})
export class AdminPaymentService {
  private mockPayments: PaymentItem[] = [
    {
      id: 'pay-8841',
      reference: '#PAY-8841',
      dateText: 'Il y a 12 min',
      fullDate: '15 Mai 2024 à 14:18:22',
      beneficiaryName: 'Chez Loutcha',
      beneficiarySubtitle: 'Plateau',
      beneficiaryInitials: 'CL',
      beneficiaryType: 'RESTAURANT',
      beneficiaryAddress: 'Dakar Plateau, Sénégal',
      beneficiaryWaveAccount: '+221 77 340 12 88',
      beneficiaryNinea: '004892182 2G3',
      beneficiaryPlanTag: 'Forfait AYYOU Pro Illimité (0% commission)',
      operationType: 'VERSEMENT_RESTAURANT',
      operationTypeLabel: 'Virement Ventes Quotidiennes',
      amount: 425000,
      amountFormatted: '425 000 FCFA',
      paymentChannel: 'WAVE_BUSINESS',
      paymentChannelLabel: 'Wave Business',
      paymentChannelDotColor: 'blue',
      status: 'RECONCILIE',
      statusText: 'RÉCONCILIÉ EN TEMPS RÉEL',
      statusColor: 'green',
      waveTxId: 'Gateway Wave Senegal API',
      breakdown: {
        grossSales: 425000,
        orderCount: 38,
        serviceFees: 0,
        ayyouCommission: 0,
        waveApiFeesOffered: -4250,
        netPayout: 425000
      },
      fiscalReceiptRef: '#FAC-2024-0515-8841',
      bankReconciliation: 'Concordance 100%',
      isVerified: true
    },
    {
      id: 'sub-2041',
      reference: '#SUB-2041',
      dateText: "Aujourd'hui 09:30",
      fullDate: '15 Mai 2024 à 09:30:00',
      beneficiaryName: 'Burger Black Bun',
      beneficiarySubtitle: 'Almadies',
      beneficiaryInitials: 'BB',
      beneficiaryType: 'RESTAURANT',
      beneficiaryAddress: 'Route des Almadies, Dakar',
      beneficiaryWaveAccount: '+221 78 120 44 99',
      beneficiaryNinea: '009124581 1B4',
      beneficiaryPlanTag: 'Forfait AYYOU Pro (50 000 FCFA/m)',
      operationType: 'ABONNEMENT_FORFAIT',
      operationTypeLabel: 'Renouvellement Forfait Pro',
      amount: 50000,
      amountFormatted: '50 000 FCFA',
      paymentChannel: 'PRELEVEMENT_CB',
      paymentChannelLabel: 'Prélèvement CB',
      paymentChannelDotColor: 'gray',
      status: 'PAYE',
      statusText: 'Abonnement Actif',
      statusColor: 'green',
      subscriptionDetails: {
        planName: 'Forfait AYYOU Pro Mensuel',
        startDate: '15/05/2024',
        dueDate: '15/06/2024',
        status: 'ACTIF',
        lastPaymentDate: '15/05/2024',
        nextPaymentDate: '15/06/2024'
      },
      fiscalReceiptRef: '#SUB-FAC-2024-2041',
      bankReconciliation: 'Concordance 100%',
      isVerified: true
    },
    {
      id: 'pay-8840',
      reference: '#PAY-8840',
      dateText: 'Il y a 45 min',
      fullDate: '15 Mai 2024 à 13:45:10',
      beneficiaryName: 'Ibrahima Sow',
      beneficiarySubtitle: 'Coursier #AYY-012',
      beneficiaryInitials: 'IS',
      beneficiaryType: 'COURSIER',
      beneficiaryAddress: 'Fann Résidence, Dakar',
      beneficiaryWaveAccount: '+221 77 889 01 22',
      operationType: 'REMUNERATION_LIVREUR',
      operationTypeLabel: 'Rémunération 24 courses',
      amount: 36000,
      amountFormatted: '36 000 FCFA',
      paymentChannel: 'WAVE_INSTANTANE',
      paymentChannelLabel: 'Wave Instantané',
      paymentChannelDotColor: 'blue',
      status: 'PAYE',
      statusText: 'Versé sur compte coursier',
      statusColor: 'green',
      breakdown: {
        grossSales: 36000,
        orderCount: 24,
        serviceFees: 0,
        ayyouCommission: 0,
        waveApiFeesOffered: 0,
        netPayout: 36000
      },
      fiscalReceiptRef: '#FAC-PAY-8840',
      bankReconciliation: 'Concordance 100%',
      isVerified: true
    },
    {
      id: 'pay-8839',
      reference: '#PAY-8839',
      dateText: 'Il y a 1 h 15',
      fullDate: '15 Mai 2024 à 13:15:00',
      beneficiaryName: 'Touba Primeurs',
      beneficiarySubtitle: 'Mermoz',
      beneficiaryInitials: 'TP',
      beneficiaryType: 'VENDEUR',
      beneficiaryAddress: 'Avenue Cheikh Anta Diop, Dakar',
      beneficiaryWaveAccount: '+221 76 554 32 10',
      beneficiaryNinea: '007788112 3C9',
      beneficiaryPlanTag: 'Forfait Vendeur AYYOU (35 000 FCFA/m)',
      operationType: 'VERSEMENT_VENDEUR',
      operationTypeLabel: 'Virement Ventes Journalières',
      amount: 185400,
      amountFormatted: '185 400 FCFA',
      paymentChannel: 'ORANGE_MONEY_PRO',
      paymentChannelLabel: 'Orange Money Pro',
      paymentChannelDotColor: 'orange',
      status: 'PAYE',
      statusText: 'Versé avec succès',
      statusColor: 'green',
      breakdown: {
        grossSales: 185400,
        orderCount: 19,
        serviceFees: 0,
        ayyouCommission: 0,
        waveApiFeesOffered: 0,
        netPayout: 185400
      },
      fiscalReceiptRef: '#FAC-PAY-8839',
      bankReconciliation: 'Concordance 100%',
      isVerified: true
    },
    {
      id: 'lit-0194',
      reference: '#LIT-0194',
      dateText: 'Il y a 2 h',
      fullDate: '15 Mai 2024 à 12:30:00',
      beneficiaryName: 'Mamadou D. ‖ Tantie Marie',
      beneficiarySubtitle: 'Commande #AYY-108B',
      beneficiaryInitials: 'LT',
      beneficiaryType: 'CLIENT',
      associatedOrderRef: '#AYY-108B',
      operationType: 'LITIGE_REMBOURSEMENT',
      operationTypeLabel: 'Litige remboursement',
      amount: 14500,
      amountFormatted: '14 500 FCFA',
      paymentChannel: 'WAVE',
      paymentChannelLabel: 'Wave',
      paymentChannelDotColor: 'blue',
      status: 'EN_ATTENTE',
      statusText: 'À vérifier (En attente d\'audit)',
      statusColor: 'orange',
      breakdown: {
        grossSales: 14500,
        orderCount: 1,
        serviceFees: 0,
        ayyouCommission: 0,
        waveApiFeesOffered: 0,
        netPayout: 14500
      },
      fiscalReceiptRef: '#LIT-FAC-0194',
      bankReconciliation: 'En attente de pièces justificatives',
      isVerified: false
    }
  ];

  private selectedPaymentSubject = new BehaviorSubject<PaymentItem | null>(this.mockPayments[0]);
  selectedPayment$ = this.selectedPaymentSubject.asObservable();

  getStatsSummary(): Observable<PaymentStatsSummary> {
    return of({
      volumeBrutGmv: 48650000,
      volumeGrowthPercent: 18.4,
      payoutsMarchandsLivreurs: 42300000,
      revenusAbonnementsPro: 6350000,
      activeSubscriptionsCount: 127,
      pendingWaveOmAmount: 1420000,
      pendingTransfersCount: 18,
      reconciliationRatePercent: 99.8,
      auditedDisputesCount: 2
    });
  }

  filterPayments(
    tab: PaymentFilterTab,
    search: string,
    method: string,
    period: string,
    status: string
  ): Observable<PaymentItem[]> {
    let result = [...this.mockPayments];

    // Filter by Tab
    if (tab === 'ABONNEMENTS') {
      result = result.filter(p => p.operationType === 'ABONNEMENT_FORFAIT');
    } else if (tab === 'VERSEMENTS_RESTAURANTS') {
      result = result.filter(p => p.operationType === 'VERSEMENT_RESTAURANT' || p.operationType === 'VERSEMENT_VENDEUR');
    } else if (tab === 'REMUNERATIONS_LIVREURS') {
      result = result.filter(p => p.operationType === 'REMUNERATION_LIVREUR');
    } else if (tab === 'ECARTS_LITIGES') {
      result = result.filter(p => p.operationType === 'LITIGE_REMBOURSEMENT' || p.status === 'EN_ATTENTE' || p.status === 'A_VERIFIER');
    }

    // Filter by Search Query
    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      result = result.filter(p =>
        p.reference.toLowerCase().includes(q) ||
        p.beneficiaryName.toLowerCase().includes(q) ||
        p.beneficiarySubtitle.toLowerCase().includes(q) ||
        p.operationTypeLabel.toLowerCase().includes(q)
      );
    }

    // Filter by Method
    if (method && method !== 'ALL') {
      result = result.filter(p => p.paymentChannel.includes(method.toUpperCase()));
    }

    // Filter by Status
    if (status && status !== 'ALL') {
      result = result.filter(p => p.status === status);
    }

    return of(result);
  }

  selectPayment(payment: PaymentItem | null): void {
    this.selectedPaymentSubject.next(payment);
  }

  verifyPayment(paymentId: string): void {
    const item = this.mockPayments.find(p => p.id === paymentId);
    if (item) {
      item.isVerified = true;
      item.status = 'RECONCILIE';
      item.statusText = 'RÉCONCILIÉ EN TEMPS RÉEL';
      item.statusColor = 'green';
      item.bankReconciliation = 'Concordance 100%';
      this.selectedPaymentSubject.next({ ...item });
    }
  }

  reminderPartner(paymentId: string): void {
    const item = this.mockPayments.find(p => p.id === paymentId);
    if (item) {
      alert(`Relance transmise avec succès au partenaire ${item.beneficiaryName} pour le renouvellement du forfait AYYOU Pro.`);
    }
  }
}
