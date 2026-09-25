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
