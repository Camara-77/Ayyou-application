export type DriverStatus = 'EN_LIVRAISON' | 'DISPONIBLE' | 'RECUPERATION' | 'HORS_LIGNE' | 'DOSSIER_A_VALIDER';

export interface DriverDocument {
  id: string;
  typeDocument?: string;
  title: string;
  subtitle: string;
  statut?: string;
  commentaire?: string;
  fichierUrl?: string;
  dateCreation?: string;
  isValidated: boolean;
  isPdf?: boolean;
  isImage?: boolean;
}

export interface AiDriverAnalysisReport {
  decision: 'CONFORME' | 'NON_CONFORME' | 'A_VERIFIER';
  confidence: number;
  inscription_info?: any;
  identity_consistency?: { status: string; details: string };
  identity_analysis?: { status: string; details: string };
  vehicle_consistency?: { status: string; details: string };
  vehicle_registration_analysis?: { status: string; details: string };
  insurance_status?: { status: string; details: string };
  insurance_analysis?: { status: string; details: string };
  driver_license_analysis?: { status: string; details: string };
  documents_analysis?: any[];
  photo_analysis?: any;
  inconsistencies: string[];
  recommendation: string;
  rejection_reasons: string[];
}

export interface DriverDetail {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  initials: string;
  licensePlate: string;
  phone: string;
  email: string;
  zone: string;
  vehicle: string;
  vehicleDeclaredFull: string;
  status: DriverStatus;
  statusText: string;
  currentMissionRef?: string;
  currentMissionTitle: string;
  currentMissionSub?: string;
  isCandidate?: boolean;
  submittedAt?: string;
  photoUrl?: string;
  documentsCount?: string;
  documents?: DriverDocument[];
  aiAnalysisReport?: AiDriverAnalysisReport;
}

export interface DriverStatsSummary {
  totalCount: number;
  connectedCount: number;
  connectedSubtext: string;
  availableCount: number;
  availableSubtext: string;
  deliveringCount: number;
  deliveringSubtext: string;
  offlineCount: number;
  offlineSubtext: string;
  applicationsCount: number;
  applicationsSubtext: string;
}

export type DriverFilterTab = 'ALL' | 'DISPONIBLE' | 'EN_LIVRAISON' | 'HORS_LIGNE' | 'DOSSIER_A_VALIDER';
