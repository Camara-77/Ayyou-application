export interface PlannedMeal {
  id: number;
  produit: number;
  nom_produit: string;
  image_url: string;
  etablissement: number;
  nom_etablissement: string;
  adresse_etablissement: string;
  variante?: number | null;
  nom_variante?: string;
  date_planifiee: string; // ISO YYYY-MM-DD
  heure_planifiee?: string | null; // HH:mm:ss or HH:mm
  creneau: 'MATIN' | 'MIDI' | 'SOIR' | 'EN_CAS';
  creneau_display: string;
  statut: 'PLANIFIE' | 'COMMANDE' | 'ANNULE';
  statut_display: string;
  prix_total: string | number;
  quantite: number;
  instructions?: string;
  rappel_valide?: boolean;
  rappel_valide_at?: string | null;
  rappel_reporte?: boolean;
  rappel_reporte_at?: string | null;
  date_creation?: string;
  date_modification?: string;
}

export interface PlanningMonthResponse {
  annee: number;
  mois: number;
  selected_date?: string | null;
  total_repas_mois: number;
  dates_avec_repas: string[];
  repas: PlannedMeal[];
}

export interface AIChatMessageItem {
  id?: number;
  conversation_id?: number;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  type_message?: 'TEXT' | 'IMAGE' | 'ACTION' | 'PLANNING';
  content: string;
  user_text?: string;
  image_url?: string;
  data_payload?: any;
  date_creation?: string;
}

export interface AIConversationItem {
  id: number;
  titre: string;
  context_data?: any;
  messages_count?: number;
  last_message?: {
    id: number;
    role: string;
    content: string;
    date_creation: string;
  } | null;
  messages?: AIChatMessageItem[];
  date_creation?: string;
  date_modification?: string;
}
