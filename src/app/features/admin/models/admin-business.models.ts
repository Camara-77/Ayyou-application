export type EstablishmentType = 'RESTAURANT' | 'VENDEUR';
export type EstablishmentStatus = 'EN_ATTENTE' | 'ACTIF' | 'SUSPENDU' | 'REJETE';

export interface EstablishmentDocument {
  id: string;
  typeDocument?: string;
  title: string;
  documentRef: string;
  subtitle: string;
  statut?: string;
  commentaire?: string;
  fichierUrl?: string;
  dateCreation?: string;
  isPdf?: boolean;
  isImage?: boolean;
  iconType: 'eye' | 'download' | 'check';
}

export interface AiDocumentAnalysisReport {
  decision: 'CONFORME' | 'NON_CONFORME' | 'A_VERIFIER';
  confidence: number;
  inscription_info?: any;
  identity_consistency?: { status: string; details: string };
  business_consistency?: { status: string; details: string };
  documents_analysis?: any[];
  photo_analysis?: any;
  inconsistencies: string[];
  recommendation: string;
  rejection_reasons: string[];
}

export interface EstablishmentDetail {
  id: string;
  name: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerFullName?: string;
  phone: string;
  email?: string;
  type: EstablishmentType;
  typeDisplay?: string;
  category: string;
  subCategory: string;
  neighborhood: string;
  address: string;
  performanceText: string;
  ordersCount: number;
  status: EstablishmentStatus;
  submittedAt: string;
  commissionRate: string;
  logoUrl?: string;
  couvertureUrl?: string;
  documentsCount: string; // e.g. '4/4 Fichiers'
  documents: EstablishmentDocument[];
  photos: string[];
  aiAnalysisReport?: AiDocumentAnalysisReport;
}

export interface EstablishmentStatsSummary {
  total: number;
  totalSubtext: string;
  activeRestaurants: number;
  activeRestaurantsSubtext: string;
  commercesAndSellers: number;
  commercesAndSellersSubtext: string;
  pendingApproval: number;
  pendingApprovalSubtext: string;
  monthlyVolume: string;
  monthlyVolumeSubtext: string;
}

export type EstablishmentFilterTab = 'ALL' | 'RESTAURANTS' | 'VENDEURS' | 'PENDING';
