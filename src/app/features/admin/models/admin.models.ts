// 1. Modèle des Cartes Statistiques KPI
export interface StatCard {
  id: string;
  title: string;
  value: string | number;
  subtext?: string;
  statusColor?: 'positive' | 'warning' | 'negative' | 'neutral';
  dotColor?: string;
}

// 2. Modèle des Actions Administratives Prioritaires
export interface PendingAction {
  id: string;
  type: 'VALIDATION_RESTAURANT' | 'VALIDATION_COURSIER' | 'ABONNEMENT_ECHEANCE' | 'DOCUMENT_VERIF';
  title: string;
  description: string;
  badgeText?: string;
  actionButtonText: 'Examiner' | 'Vérifier' | 'Relancer';
  targetId: string;
}

// 3. Modèle Utilisateur Admin
export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  accountType: 'CLIENT' | 'RESTAURANT' | 'VENDEUR' | 'LIVREUR';
  status: 'ACTIF' | 'EN_ATTENTE' | 'SUSPENDU';
  createdAt: string;
}

// 4. Modèle Établissement (Restaurant / Vendeur)
export interface Business {
  id: string;
  name: string;
  ownerName: string;
  type: 'RESTAURANT' | 'VENDEUR';
  category: string;
  district: string;
  phone: string;
  isOpen: boolean;
  subscriptionStatus: 'ACTIF' | 'ECHEANCE_PROCHE' | 'EXPIRE';
  validationStatus: 'VALIDE' | 'EN_ATTENTE' | 'REJETE';
}

// 5. Modèle Livreur / Coursier
export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehiclePlate: string;
  district: string;
  status: 'EN_LIGNE_DISPONIBLE' | 'EN_LIVRAISON' | 'HORS_LIGNE';
  currentOrderId?: string;
}

// 6. Modèle Commande Admin (Commande en cours)
export interface AdminOrder {
  id: string;
  reference: string;
  customerName: string;
  merchantName: string;
  amount: number;
  amountFormatted: string;
  status: 'Prête (Prise en charge livreur)' | 'En préparation' | 'En livraison' | 'Terminée' | 'Annulée';
  statusColor: 'green' | 'orange' | 'blue' | 'gray' | 'red';
  createdAt?: string;
}

// 7. Modèle Livraison Admin (Livraison en cours)
export interface AdminDelivery {
  id: string;
  driverName: string;
  vehiclePlate: string;
  origin: string;
  destination: string;
  statusText: string;
  statusColor: 'green' | 'red' | 'blue' | 'orange';
  estimatedMinutes?: number;
}

// 8. Modèle Candidature Professionnelle
export interface Application {
  id: string;
  applicantName: string;
  structureName: string;
  type: 'RESTAURANT' | 'VENDEUR' | 'LIVREUR';
  appliedAt: string;
  status: 'EN_ATTENTE' | 'EN_EXAMEN' | 'VALIDE' | 'REJETE';
  documentsCount: number;
}

// 9. Modèle Catégorie AYYOU
export interface Category {
  id: string;
  name: string;
  target: 'RESTAURANT' | 'VENDEUR' | 'DISH';
  description?: string;
  imageUrl: string;
  isActive: boolean;
  displayOrder: number;
}

// 10. Modèle Paiement & Transaction
export interface Payment {
  id: string;
  reference: string;
  merchantName: string;
  amount: number;
  method: 'WAVE' | 'ORANGE_MONEY';
  status: 'PAYE' | 'EN_ATTENTE' | 'ECHOUE';
  dateText: string;
}

// 11. Modèle Abonnement Marchand
export interface Subscription {
  id: string;
  merchantName: string;
  planName: string;
  amount: number;
  status: 'ACTIF' | 'SOUS_48H' | 'EXPIRE' | 'SUSPENDU';
  expiresAt: string;
}
