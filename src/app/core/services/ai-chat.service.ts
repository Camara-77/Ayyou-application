import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RecommendationCard {
  produit_id: number;
  nom: string;
  etablissement_id: number;
  etablissement_nom: string;
  adresse: string;
  temps_livraison: string;
  prix_base: number;
  prix_formate: string;
  image_url: string;
  est_disponible: boolean;
}

export interface ActionProposal {
  action_type: string;
  planning_id?: number;
  order_id?: number;
  nom_produit?: string;
  nom_etablissement?: string;
  current_date?: string;
  current_creneau?: string;
  changes?: any;
  summary?: string;
}

export interface ChatMessage {
  id?: string;
  sender: 'ai' | 'user';
  text: string;
  cards?: RecommendationCard[];
  action_proposal?: ActionProposal;
  timestamp: Date;
}

export interface AIChatResponse {
  status: string;
  reply: string;
  cards?: RecommendationCard[];
  action_proposal?: ActionProposal;
  planning?: any;
  intent?: any;
  user_name?: string;
  quota_used?: number;
  quota_max?: number;
  is_quota_exceeded?: boolean;
  seconds_remaining?: number;
  formatted_time_remaining?: string;
  reset_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiChatService {
  private apiUrl = `${environment.apiUrl}/api/ai/chat/`;

  constructor(private http: HttpClient) {}

  sendMessage(message: string, history: { sender: string; text: string }[] = [], context: any = {}, confirmAction: boolean = false): Observable<AIChatResponse> {
    const payload: any = { message, history, context };
    if (confirmAction) {
      payload.confirm_action = true;
    }
    return this.http.post<AIChatResponse>(this.apiUrl, payload).pipe(
      catchError(error => {
        console.error('Error communicating with AYYOU AI Chatbot:', error);
        return of({
          status: 'error',
          reply: 'Désolé, je rencontre une petite difficulté technique pour accéder au catalogue. N’hésitez pas à réessayer ! 🍲',
          cards: []
        });
      })
    );
  }
}
