import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DetectedProduct {
  id: number;
  nom: string;
  description?: string;
  prix: number;
  prix_formate: string;
  image_url: string;
  etablissement_id: number;
  etablissement_nom: string;
  etablissement_adresse: string;
  est_disponible?: boolean;
  categorie_nom?: string;
}

export interface DetectedEstablishment {
  id: number;
  product_id?: number;
  nom: string;
  adresse: string;
  type_etablissement?: string;
  categorie_nom?: string;
  image_url?: string;
  couverture_url?: string;
  logo_url?: string;
  produit_propose?: string;
  prix?: number;
  prix_formate?: string;
}

export interface DetectedDatetime {
  date_iso: string;
  date_label: string;
  time_label: string;
  creneau: 'MATIN' | 'MIDI' | 'SOIR' | 'EN_CAS';
}

export interface SuggestedAction {
  label: string;
  action: string;
  planning_id?: number;
}

export interface SuggestedCategory {
  id: number;
  nom: string;
  slug: string;
  icone?: string;
  image_url?: string;
  nombre_plats?: number;
}

export interface PlanningAiParseResponse {
  status: 'success' | 'missing_info' | 'error' | 'food_search' | 'food_recommendation' | 'restaurant_search' | 'category_search' | 'food_help' | 'ambiguous' | 'out_of_scope' | 'app_help' | 'food_identified' | 'non_food_image' | 'unclear_image' | 'ambiguous_food_image' | 'no_product_found' | 'invalid_format' | 'unreadable_image' | 'restaurant_selected' | 'planning_created' | 'declined' | 'greeting' | 'capabilities' | 'general_conversation' | 'budget_discovery' | 'unclear_query' | string;
  intent?: string;
  type?: string;
  entity?: 'restaurant' | 'product' | 'category';
  message: string;
  user_text?: string;
  conversation_id?: number;
  planning_id?: number;
  quantite?: number;
  detected_product?: DetectedProduct | null;
  detected_establishment?: DetectedEstablishment | null;
  detected_datetime?: DetectedDatetime | null;
  detected_options?: string;
  matching_products?: DetectedProduct[];
  matching_establishments?: DetectedEstablishment[];
  suggested_categories?: SuggestedCategory[];
  suggested_actions?: SuggestedAction[];
  is_food?: boolean;
  total_count?: number;
  has_more?: boolean;
  remaining_count?: number;
  offset?: number;
  limit?: number;
}

export interface CreatePlanningPayload {
  produit: number;
  etablissement: number;
  date_planifiee: string;
  creneau: string;
  prix_total: number;
  quantite?: number;
  instructions?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlanningAiService {
  private aiParseUrl = `${environment.apiUrl}/api/ai/planning-parse/`;
  private aiVisionUrl = `${environment.apiUrl}/api/ai/vision-analyze/`;
  private aiConversationsUrl = `${environment.apiUrl}/api/ai/conversations/`;
  private createPlanningUrl = `${environment.apiUrl}/api/orders/planning/`;

  constructor(private http: HttpClient) {}

  /**
   * Envoie le prompt (texte ou transcrit) avec le conversationId pour persistance et mémoire contextuelle
   */
  parsePrompt(
    prompt: string,
    forceAction?: string,
    conversationId?: number,
    productId?: number,
    establishmentId?: number,
    offset?: number,
    limit?: number
  ): Observable<PlanningAiParseResponse> {
    const payload: any = { prompt };
    if (forceAction) {
      payload.force_action = forceAction;
    }
    if (conversationId) {
      payload.conversation_id = conversationId;
    }
    if (productId) {
      payload.product_id = productId;
    }
    if (establishmentId) {
      payload.establishment_id = establishmentId;
    }
    if (offset !== undefined) {
      payload.offset = offset;
    }
    if (limit !== undefined) {
      payload.limit = limit;
    }
    return this.http.post<PlanningAiParseResponse>(this.aiParseUrl, payload).pipe(
      catchError(err => {
        console.error('Erreur analyse IA planning:', err);
        const fallback: PlanningAiParseResponse = {
          status: 'error',
          message: 'Impossible d\'analyser votre demande pour le moment. Veuillez réessayer.',
          user_text: prompt,
          detected_product: null,
          detected_establishment: null,
          detected_datetime: null,
          detected_options: ''
        };
        return of(fallback);
      })
    );
  }

  /**
   * Analyse une image de nourriture envoyée via le bouton + (JPG, PNG, WEBP)
   */
  analyzeImage(file: File): Observable<PlanningAiParseResponse> {
    const formData = new FormData();
    formData.append('image', file, file.name);

    return this.http.post<PlanningAiParseResponse>(this.aiVisionUrl, formData).pipe(
      catchError(err => {
        console.error('Erreur analyse image vision:', err);
        const fallback: PlanningAiParseResponse = {
          status: 'error',
          message: 'Erreur lors de l\'analyse de l\'image. Assurez-vous d\'envoyer une image valide (JPG, PNG ou WEBP).',
          detected_product: null,
          detected_establishment: null,
          detected_datetime: null,
          detected_options: ''
        };
        return of(fallback);
      })
    );
  }

  /**
   * Récupère la liste des conversations enregistrées du client
   */
  getConversations(): Observable<any[]> {
    return this.http.get<any[]>(this.aiConversationsUrl).pipe(
      catchError(() => of([]))
    );
  }

  /**
   * Démarre une nouvelle conversation
   */
  createConversation(titre: string = 'Nouvelle conversation'): Observable<any> {
    return this.http.post<any>(`${this.aiConversationsUrl}new/`, { titre }).pipe(
      catchError(err => {
        console.error('Erreur création conversation:', err);
        return of(null);
      })
    );
  }

  /**
   * Récupère les messages d'une conversation spécifique
   */
  getConversationMessages(id: number): Observable<any> {
    return this.http.get<any>(`${this.aiConversationsUrl}${id}/`).pipe(
      catchError(err => {
        console.error('Erreur chargement messages conversation:', err);
        return of(null);
      })
    );
  }

  /**
   * Supprime une conversation
   */
  deleteConversation(id: number): Observable<any> {
    return this.http.delete<any>(`${this.aiConversationsUrl}${id}/`).pipe(
      catchError(() => of(null))
    );
  }

  /**
   * Enregistre le planning confirmé en base PostgreSQL
   */
  confirmPlanning(payload: CreatePlanningPayload): Observable<any> {
    return this.http.post<any>(this.createPlanningUrl, payload);
  }
}
