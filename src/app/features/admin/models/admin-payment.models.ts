export type PaymentOperationType =
  | 'PAIEMENT_COMMANDE'
  | 'ABONNEMENT_FORFAIT'
  | 'VERSEMENT_RESTAURANT'
  | 'VERSEMENT_VENDEUR'
  | 'REMUNERATION_LIVREUR'
  | 'LITIGE_REMBOURSEMENT';

export type PaymentChannel =
  | 'WAVE_BUSINESS'
  | 'WAVE_INSTANTANE'
  | 'WAVE'
  | 'ORANGE_MONEY_PRO'
  | 'PRELEVEMENT_CB';

export type PaymentStatus =
  | 'PAYE'
  | 'EN_ATTENTE'
  | 'ECHOUER'
  | 'A_VERIFIER'
  | 'ECHEANCE_PROCHE'
  | 'RECONCILIE';

export type PaymentFilterTab =
  | 'ALL'
  | 'ABONNEMENTS'
  | 'VERSEMENTS_RESTAURANTS'
  | 'REMUNERATIONS_LIVREURS'
  | 'ECARTS_LITIGES';

export interface PaymentBreakdown {
  grossSales: number;             // e.g. 425000
  orderCount?: number;            // e.g. 38
  serviceFees: number;            // 0
  ayyouCommission: number;        // 0 (0% commission model)
  waveApiFeesOffered: number;     // -4250
  netPayout: number;              // 425000
}

export interface PaymentSubscriptionInfo {
  planName: string;               // e.g. 'Forfait AYYOU Pro (50k FCFA/m)'
  startDate: string;              // e.g. '15/05/2023'
  dueDate: string;                // e.g. '15/06/2024'
  status: 'ACTIF' | 'ECHEANCE_PROCHE' | 'ECHU';
  lastPaymentDate: string;
  nextPaymentDate: string;
}

export interface PaymentItem {
  id: string;                     // 'pay-8841', 'sub-2041'
  reference: string;              // '#PAY-8841', '#SUB-2041'
  dateText: string;               // 'Il y a 12 min', "Aujourd'hui 09:30"
  fullDate: string;               // '15 Mai 2024 à 14:18:22'
  
  beneficiaryName: string;        // 'Chez Loutcha', 'Burger Black Bun', 'Ibrahima Sow'
  beneficiarySubtitle: string;    // 'Plateau', 'Almadies', 'Coursier #AYY-012'
  beneficiaryInitials: string;    // 'CL', 'BB', 'IS', 'TP', 'LT'
  beneficiaryType: 'RESTAURANT' | 'VENDEUR' | 'COURSIER' | 'CLIENT';
  beneficiaryAddress?: string;    // 'Dakar Plateau, Sénégal'
  beneficiaryWaveAccount?: string;// '+221 77 340 12 88'
  beneficiaryNinea?: string;      // '004892182 2G3'
  beneficiaryPlanTag?: string;    // 'Forfait AYYOU Pro Illimité (0% commission)'
  
  operationType: PaymentOperationType;
  operationTypeLabel: string;     // 'Virement Ventes Quotidiennes', 'Renouvellement Forfait Pro'
  
  amount: number;                 // 425000
  amountFormatted: string;        // '425 000 FCFA'
  
  paymentChannel: PaymentChannel;
  paymentChannelLabel: string;    // 'Wave Business', 'Prélèvement CB', 'Orange Money Pro'
  paymentChannelDotColor: 'blue' | 'orange' | 'gray';
  
  status: PaymentStatus;
  statusText: string;             // 'Payé', 'RÉCONCILIÉ EN TEMPS RÉEL', 'À vérifier'
  statusColor: 'green' | 'orange' | 'red' | 'gray';
  
  waveTxId?: string;              // 'Gateway Wave Senegal API'
  associatedOrderRef?: string;    // '#AYY-108B'
  
  subscriptionDetails?: PaymentSubscriptionInfo;
  breakdown?: PaymentBreakdown;
  
  fiscalReceiptRef?: string;      // '#FAC-2024-0515-8841'
  bankReconciliation?: string;    // 'Concordance 100%'
  isVerified: boolean;
}

export interface PaymentStatsSummary {
  volumeBrutGmv: number;              // 48650000
  volumeGrowthPercent: number;        // +18.4
  payoutsMarchandsLivreurs: number;   // 42300000
  revenusAbonnementsPro: number;       // 6350000
  activeSubscriptionsCount: number;    // 127
  pendingWaveOmAmount: number;        // 1420000
  pendingTransfersCount: number;       // 18
  reconciliationRatePercent: number;  // 99.8
  auditedDisputesCount: number;       // 2
}
