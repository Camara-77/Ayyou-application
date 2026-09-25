import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ProOrder, ProOrderItem } from '../models/pro';

export interface BackendSousCommande {
  id: number;
  commande: number;
  numero_commande: string;
  etablissement: number;
  statut: string;
  statut_display: string;
  sous_total: string;
  frais_livraison: string;
  total: string;
  client_nom: string;
  client_telephone: string;
  adresse_livraison: string;
  instructions_livraison: string;
  lignes: {
    id: number;
    produit: number | null;
    nom_produit: string;
    quantite: number;
    prix_unitaire: string;
    total_ligne: string;
    variante?: string;
    options?: string[];
  }[];
  date_creation: string;
  date_modification: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProOrderService {
  private http = inject(HttpClient);
  private proMerchantApiUrl = environment.apiUrl ? `${environment.apiUrl}/api/pro/merchant` : '/api/pro/merchant';

  private initialOrders: ProOrder[] = [];

  private ordersSubject = new BehaviorSubject<ProOrder[]>(this.initialOrders);
  allOrders$: Observable<ProOrder[]> = this.ordersSubject.asObservable();
  orders$: Observable<ProOrder[]> = this.allOrders$;

  private urgentSubject = new BehaviorSubject<ProOrder[]>([]);
  urgentOrders$: Observable<ProOrder[]> = this.urgentSubject.asObservable();

  constructor() {
    this.updateUrgentList();
    this.fetchMerchantOrders().subscribe();
  }

  get orders(): ProOrder[] {
    return this.ordersSubject.value;
  }

  /**
   * GET /api/pro/merchant/orders/
   * Charge les sous-commandes réelles du marchand connecté et met à jour le BehaviorSubject.
   */
  fetchMerchantOrders(): Observable<ProOrder[]> {
    return this.http.get<any>(`${this.proMerchantApiUrl}/orders/`).pipe(
      map(res => {
        const backendOrders: BackendSousCommande[] = Array.isArray(res) ? res : (res?.results || []);
        const mappedOrders = (backendOrders || []).map(b => this.mapBackendToProOrder(b));
        this.ordersSubject.next(mappedOrders);
        this.updateUrgentList();
        return mappedOrders;
      }),
      catchError(() => {
        this.ordersSubject.next([]);
        this.updateUrgentList();
        return of([]);
      })
    );
  }

  /**
   * PATCH /api/pro/merchant/orders/{id}/status/
   * Met à jour le statut d'une sous-commande marchand et met à jour les streams réactifs.
   */
  updateOrderStatus(orderId: string, status: string): void {
    // Mise à jour optimiste locale
    const current = [...this.ordersSubject.value];
    const index = current.findIndex(o => o.id === orderId || o.orderRef === orderId);
    if (index > -1) {
      current[index] = { ...current[index], status };
      this.ordersSubject.next(current);
      this.updateUrgentList();
    }

    // Appel API backend réactif
    this.http.patch<BackendSousCommande>(`${this.proMerchantApiUrl}/orders/${orderId}/status/`, { statut: status }).pipe(
      tap(updatedBackendOrder => {
        const updated = this.mapBackendToProOrder(updatedBackendOrder);
        const latest = [...this.ordersSubject.value];
        const idx = latest.findIndex(o => o.id === orderId || o.orderRef === orderId);
        if (idx > -1) {
          latest[idx] = updated;
          this.ordersSubject.next(latest);
          this.updateUrgentList();
        }
      }),
      catchError(err => {
        return of(null);
      })
    ).subscribe();
  }

  private updateUrgentList(): void {
    const urgent = this.ordersSubject.value.filter(o =>
      o.status === 'EN_ATTENTE' ||
      o.status === 'VALIDEE' ||
      o.status === 'PREPARATION' ||
      o.status === 'PRETE' ||
      o.status === 'BROUILLON' ||
      o.status === 'EN_ATTENTE_PAIEMENT' ||
      o.status === 'PAYEE' ||
      o.status === 'EN_PREPARATION' ||
      o.status === 'pending'
    );
    this.urgentSubject.next(urgent);
  }

  getUrgentOrders(): Observable<ProOrder[]> {
    return this.urgentOrders$;
  }

  getHistoryOrders(query: string = '', filter: string = 'all'): Observable<ProOrder[]> {
    let list = [...this.ordersSubject.value];
    if (filter === 'delivered') {
      list = list.filter(o => o.status === 'LIVREE' || o.status === 'delivered');
    }
    return of(list);
  }

  /**
   * Transforme un objet SousCommande Backend Django DRF au format ProOrder UI Angular.
   */
  private mapBackendToProOrder(b: BackendSousCommande): ProOrder {
    const dateObj = b.date_creation ? new Date(b.date_creation) : new Date();
    const timeFormatted = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const items: ProOrderItem[] = (b.lignes || []).map(l => ({
      name: l.nom_produit,
      quantity: l.quantite,
      totalPrice: parseFloat(l.total_ligne || '0')
    }));

    const itemsText = items.map(i => `${i.quantity}x ${i.name}`).join(', ');

    return {
      id: b.id.toString(),
      orderRef: b.numero_commande || `AY-${b.id}`,
      type: 'delivery',
      serviceMode: 'LIVRAISON',
      isUrgent: b.statut === 'PAYEE' || b.statut === 'BROUILLON' || b.statut === 'EN_ATTENTE_PAIEMENT',
      status: b.statut,
      clientName: b.client_nom || 'Client AYYOU',
      deliveryAddress: b.adresse_livraison || '',
      timeAgo: timeFormatted,
      timeFormatted: timeFormatted,
      createdAt: b.date_creation,
      itemsText: itemsText,
      items: items,
      paymentMethodText: 'Payé via AYYOU',
      paymentDotClass: 'dot-green',
      totalPrice: parseFloat(b.total || '0'),
      totalAmount: parseFloat(b.total || '0'),
      dateGroup: "AUJOURD'HUI — " + dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }).toUpperCase()
    };
  }
}
