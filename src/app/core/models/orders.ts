export interface BackendAddress {
  id?: number;
  titre: string;
  adresse: string;
  latitude?: number | null;
  longitude?: number | null;
  instructions?: string;
  est_defaut?: boolean;
  date_creation?: string;
}

export interface BackendCartItemVariant {
  id: number;
  titre: string;
  surcout_prix: string;
}

export interface BackendCartItemOption {
  id: number;
  type_option: string;
  titre: string;
  surcout_prix: string;
}

export interface BackendCartItemProduct {
  id: number | string;
  nom: string;
  description?: string;
  prix_base: string;
  image_url?: string;
  etablissement_id?: string;
  etablissement_nom?: string;
  est_disponible?: boolean;
}

export interface BackendCartItem {
  id: number;
  produit: BackendCartItemProduct;
  quantite: number;
  prix_unitaire: string;
  variante?: BackendCartItemVariant | null;
  options?: BackendCartItemOption[];
  prix_total_unitaire: string;
  total_ligne: string;
}

export interface BackendCart {
  id: number;
  actif: boolean;
  items: BackendCartItem[];
  total_panier: string;
  nombre_articles: number;
  date_creation?: string;
  date_modification?: string;
}

export interface CheckoutPayload {
  adresse_livraison: string;
  latitude_livraison?: number | null;
  longitude_livraison?: number | null;
  instructions_livraison?: string;
  destinataire?: {
    nom?: string;
    telephone?: string;
  };
}

export interface OrderLineVariantSnapshot {
  id: number;
  nom_variante_snapshot: string;
  prix_supplementaire_snapshot: string;
}

export interface OrderLineOptionSnapshot {
  id: number;
  nom_option_snapshot: string;
  type_option_snapshot: string;
  prix_supplementaire_snapshot: string;
}

export interface OrderLine {
  id: number;
  produit?: number | string;
  nom_produit_snapshot: string;
  quantite: number;
  prix_unitaire: string;
  total_ligne: string;
  variante_snapshot?: OrderLineVariantSnapshot | null;
  options_snapshot?: OrderLineOptionSnapshot[];
}

export interface SubOrder {
  id: number;
  etablissement?: number | string;
  etablissement_nom: string;
  etablissement_logo?: string;
  etablissement_adresse?: string;
  etablissement_specialite?: string;
  etablissement_statut?: string;
  statut: string;
  sous_total: string;
  frais_livraison: string;
  total: string;
  lignes: OrderLine[];
}

export interface CommandeOrder {
  id: number;
  numero_commande: string;
  statut: string;
  sous_total: string;
  frais_livraison: string;
  total: string;
  adresse_livraison: string;
  latitude_livraison?: string | number | null;
  longitude_livraison?: string | number | null;
  instructions_livraison?: string;
  nom_destinataire?: string;
  telephone_destinataire?: string;
  mode_paiement?: string;
  sous_commandes: SubOrder[];
  date_creation: string;
}
