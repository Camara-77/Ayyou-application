export type DeliveryStatus =
  | 'EN_ATTENTE'
  | 'AFFECTEE'
  | 'ACCEPTEE'
  | 'ARRIVE_RESTAURANT'
  | 'EN_PREPARATION'
  | 'PRETE'
  | 'EN_LIVRAISON'
  | 'LIVREE'
  | 'ANNULEE';

export type ValidationMethod = 'QR_CODE' | 'CODE_VALIDATION';

export interface EtablissementLigneItem {
  id: number;
  nom_produit: string;
  quantite: number;
}

export interface EtablissementLivraisonDetail {
  id: number;
  nom: string;
  adresse: string;
  telephone: string;
  latitude: string | null;
  longitude: string | null;
  lignes: EtablissementLigneItem[];
}

export interface Livraison {
  id: number;
  commande: number;
  commande_reference: string;
  statut: DeliveryStatus;
  statut_display: string;

  // Financier & instructions
  frais_livraison: string;
  total_commande: string;
  instructions_livraison?: string;

  // Destinataire (Client)
  nom_destinataire: string;
  telephone_destinataire: string;
  adresse_livraison: string;
  latitude_livraison?: string | number | null;
  longitude_livraison?: string | number | null;

  // Livreur
  livreur?: number | null;
  livreur_id?: number | null;
  livreur_nom_complet?: string | null;

  // Établissements & articles à récupérer
  etablissements?: EtablissementLivraisonDetail[];

  // Token et Code
  token_qr: string;
  code_validation: string;
  est_validee: boolean;
  methode_validation?: ValidationMethod | null;
  methode_validation_display?: string | null;
  date_validation?: string | null;
  date_attribution?: string | null;
  acceptance_deadline?: string | null;

  created_at: string;
  updated_at: string;
}

export interface ValidateQrPayload {
  token_qr: string;
}

export interface ValidateCodePayload {
  commande: number;
  code_validation: string;
}

export interface LivreurProfile {
  id: number;
  user: number;
  email?: string;
  prenom?: string;
  nom?: string;
  numero_telephone?: string;
  statut_verification: 'EN_ATTENTE' | 'VALIDE' | 'REFUSE';
  statut_verification_display?: string;
  est_disponible: boolean;
  latitude_actuelle?: number | string | null;
  longitude_actuelle?: number | string | null;
  date_derniere_position?: string | null;
  type_vehicule?: string;
  type_vehicule_display?: string;
  marque?: string;
  modele?: string;
  immatriculation?: string;
  photo_avatar?: string | null;
  date_expiration_assurance?: string | null;
  statut_assurance?: string | null;
  equipements_certifies?: string | null;
  secteur_intervention?: string | null;
  type_compte_reversement?: string | null;
  numero_reversement?: string | null;
  comptes_reversement?: any[];
  matricule?: string;
  permis_conduire?: string;
  telephone_reversement?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LivreurDocument {
  id: number;
  type_document: string;
  type_document_display?: string;
  fichier?: string;
  statut: 'EN_ATTENTE' | 'VALIDE' | 'REFUSE';
  statut_display?: string;
  commentaire?: string;
  created_at?: string;
}

export interface AvailabilityPayload {
  est_disponible: boolean;
}

