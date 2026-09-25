export type PaymentMethod = 'WAVE' | 'ORANGE_MONEY' | 'CARTE_BANCAIRE' | 'ESPECES';
export type PaymentStatus = 'EN_ATTENTE' | 'INITIE' | 'PAYE' | 'ECHOUE' | 'EXPIRE' | 'ANNULE';

export interface Payment {
  id: number;
  reference: string;
  commande: number;
  commande_id?: number;
  commande_numero?: string;
  montant: string;
  methode: PaymentMethod | string;
  methode_nom?: string;
  statut: PaymentStatus | string;
  statut_nom?: string;
  transaction_externe?: string | null;
  date_creation: string;
  date_paiement?: string | null;
  metadata?: Record<string, any> | null;
}

export interface InvoiceLineDetail {
  etablissement: string;
  produit: string;
  quantite: number;
  prix_unitaire: string;
  total_ligne: string;
}

export interface Invoice {
  id: number;
  numero_facture: string;
  commande: number;
  commande_id?: number;
  commande_numero?: string;
  paiement?: number | null;
  nom_client_snapshot: string;
  telephone_client_snapshot: string;
  adresse_livraison_snapshot: string;
  montant_ht: string;
  frais_livraison: string;
  montant_total: string;
  details_lignes_snapshot?: InvoiceLineDetail[];
  est_payee: boolean;
  date_emission: string;
  date_paiement?: string | null;
}

export interface CreatePaymentPayload {
  commande: number;
  methode: PaymentMethod | string;
}

export interface ConfirmPaymentPayload {
  transaction_externe?: string;
}

export interface InitiatePaydunyaPayload {
  commande_id: number;
  methode?: PaymentMethod | string;
  return_url?: string;
  cancel_url?: string;
}

export interface InitiatePaydunyaResponse {
  payment_id: number;
  reference: string;
  token: string;
  checkout_url: string;
  statut: PaymentStatus | string;
  montant: string;
}

export interface InitiatePayTechPayload {
  commande_id: number;
  methode?: PaymentMethod | string;
  return_url?: string;
  cancel_url?: string;
}

export interface InitiatePayTechResponse {
  payment_id: number;
  reference: string;
  token: string;
  redirect_url: string;
  statut: PaymentStatus | string;
  montant: string;
  calculs?: {
    sous_total_plats: string;
    frais_livraison_brut: string;
    montant_total: string;
  };
}

export interface PaymentStatusCheckResponse {
  id: number;
  reference: string;
  statut: PaymentStatus | string;
  est_paye: boolean;
  date_paiement?: string | null;
  transaction?: Payment;
}

