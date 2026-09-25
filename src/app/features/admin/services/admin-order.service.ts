import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  LogisticsCorridor,
  Order,
  OrderFilterTab,
  OrderStatsSummary,
  OrderStatus
} from '../models/admin-order.models';
import { environment } from '../../../../environments/environment';

function mapBackendOrderToOrder(o: any): Order {
  const ref = o.numero_commande ? `#${o.numero_commande}` : `#AYY-${o.id}`;

  let status: OrderStatus = 'EN_PREPARATION';
  let statusDotColor: 'blue' | 'green' | 'orange' | 'red' = 'orange';

  const rawStatut = (o.statut || '').toUpperCase();
  if (rawStatut === 'EN_LIVRAISON') {
    status = 'EN_LIVRAISON';
    statusDotColor = 'blue';
  } else if (rawStatut === 'LIVREE') {
    status = 'LIVREE';
    statusDotColor = 'green';
  } else if (rawStatut === 'PRETE') {
    status = 'PRETE';
    statusDotColor = 'green';
  } else if (rawStatut === 'ANNULEE') {
    status = 'ANNULEE';
    statusDotColor = 'red';
  } else if (rawStatut === 'A_PREPARER') {
    status = 'A_PREPARER';
    statusDotColor = 'orange';
  } else {
    status = 'EN_PREPARATION';
    statusDotColor = 'orange';
  }

  const creationDate = o.date_creation ? new Date(o.date_creation) : new Date();
  const createdTime = creationDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const timeAgo = `Inscrit le ${creationDate.toLocaleDateString('fr-FR')}`;

  const sousTotalNum = Number(o.sous_total || o.total || 0);
  const totalNum = Number(o.total || 0);
  const fraisNum = Number(o.frais_livraison || 0);

  const amountFormatted = `${new Intl.NumberFormat('fr-FR').format(totalNum)} FCFA`;
  const clientName = o.nom_destinataire || o.client_nom || 'Client';
  const clientPhone = o.telephone_destinataire || '';
  const deliveryAddress = o.adresse_livraison || 'Dakar, Sénégal';
  const district = deliveryAddress.split(',')[0].trim() || 'Dakar';
  const establishmentName = o.etablissement_nom || o.vendeur_nom || 'Établissement';

  const subOrderItems: any[] = [];
  if (o.lignes && Array.isArray(o.lignes) && o.lignes.length > 0) {
    o.lignes.forEach((l: any, idx: number) => {
      const priceNum = Number(l.prix_unitaire || l.prix || 0);
      const qte = Number(l.quantite || 1);
      const lineTotal = priceNum * qte;
      subOrderItems.push({
        id: `item-${l.id || idx}`,
        name: l.nom_produit || l.produit_nom || `Produit #${l.id || idx}`,
        quantity: qte,
        priceFormatted: `${new Intl.NumberFormat('fr-FR').format(lineTotal || sousTotalNum)} FCFA`,
        priceAmount: lineTotal || sousTotalNum,
        description: l.variante_nom || (l.options && l.options.length > 0 ? l.options.map((opt: any) => opt.nom).join(', ') : `Ligne de commande ${ref}`)
      });
    });
  } else {
    subOrderItems.push({
      id: `item-${o.id}`,
      name: `Commande ${ref}`,
      quantity: 1,
      priceFormatted: `${new Intl.NumberFormat('fr-FR').format(sousTotalNum)} FCFA`,
      priceAmount: sousTotalNum,
      description: `Commande ${ref} enregistrée dans le système`
    });
  }

  return {
    id: o.id ? o.id.toString() : '',
    reference: ref,
    timeAgo,
    createdTime,
    estimatedTime: '30 min',
    client: {
      id: o.utilisateur ? o.utilisateur.toString() : 'c-001',
      name: clientName,
      phone: clientPhone,
      deliveryAddress
    },
    establishmentName,
    establishmentDistrict: district,
    isMultiVendor: false,
    amountFormatted,
    articlesCount: subOrderItems.length,
    status,
    statusText: o.statut_display || o.statut || 'En cours',
    statusDotColor,
    subOrders: [
      {
        id: `so-${o.id}`,
        establishmentName,
        establishmentTypeLabel: 'RESTAURATEUR',
        address: 'Dakar, Sénégal',
        phone: clientPhone,
        subtotalFormatted: `${new Intl.NumberFormat('fr-FR').format(sousTotalNum)} FCFA`,
        items: subOrderItems
      }
    ],
    payment: {
      id: `p-${o.id}`,
      method: 'WAVE',
      methodLabel: 'Paiement en ligne',
      reference: `#PAY-${o.id}`,
      status: 'PAYE',
      statusText: 'Payé via API',
      subtotalFormatted: `${new Intl.NumberFormat('fr-FR').format(sousTotalNum)} FCFA`,
      deliveryFeeFormatted: `${new Intl.NumberFormat('fr-FR').format(fraisNum)} FCFA`,
      totalPaidFormatted: amountFormatted,
      driverPayoutFormatted: `${new Intl.NumberFormat('fr-FR').format(fraisNum)} FCFA`,
      merchantPayoutFormatted: `${new Intl.NumberFormat('fr-FR').format(sousTotalNum)} FCFA`,
      commissionNote: '0% commission • Modèle AYYOU Abonnement Pro'
    },
    delivery: {
      id: `d-${o.id}`,
      driverName: o.livreur_nom || 'Non attribué',
      driverPhone: o.livreur_telephone || '',
      driverVehicle: o.livreur_vehicule || 'Moto Service',
      distanceFromClientText: 'En cours',
      statusText: o.statut_display || 'En livraison'
    }
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminOrderService {
  private http = inject(HttpClient);

  private ordersSubject = new BehaviorSubject<Order[]>([]);
  private selectedSubject = new BehaviorSubject<Order | null>(null);

  orders$ = this.ordersSubject.asObservable();
  selectedOrder$ = this.selectedSubject.asObservable();

  getStatsSummary(): Observable<OrderStatsSummary> {
    const url = `${environment.apiUrl}/api/admin/orders/`;
    return this.http.get<any>(url).pipe(
      map(res => {
        const rawItems: any[] = Array.isArray(res) ? res : (res.results || []);
        const items = rawItems.map(mapBackendOrderToOrder);

        const todayCount = items.length;
        const totalSum = rawItems.reduce((acc, o) => acc + Number(o.total || 0), 0);
        const todayVolumeFormatted = `Volume: ${new Intl.NumberFormat('fr-FR').format(totalSum)} FCFA`;
        const preparingCount = items.filter(o => o.status === 'EN_PREPARATION' || o.status === 'A_PREPARER').length;
        const deliveringCount = items.filter(o => o.status === 'EN_LIVRAISON').length;
        const deliveredCount = items.filter(o => o.status === 'LIVREE').length;
        const canceledCount = items.filter(o => o.status === 'ANNULEE').length;

        return {
          todayCount,
          todayVolumeFormatted,
          preparingCount,
          deliveringCount,
          deliveredCount,
          deliveredSuccessRate: todayCount > 0 ? `${((deliveredCount / todayCount) * 100).toFixed(1)}%` : '100%',
          canceledCount,
          canceledAuditRate: todayCount > 0 ? `${((canceledCount / todayCount) * 100).toFixed(1)}%` : '0%'
        };
      }),
      catchError(() => of({
        todayCount: 0,
        todayVolumeFormatted: 'Volume: 0 FCFA',
        preparingCount: 0,
        deliveringCount: 0,
        deliveredCount: 0,
        deliveredSuccessRate: '0%',
        canceledCount: 0,
        canceledAuditRate: '0%'
      }))
    );
  }

  getCorridors(): Observable<LogisticsCorridor[]> {
    const orders = this.ordersSubject.getValue();
    if (orders.length === 0) {
      return of([
        {
          id: 'cor-1',
          name: 'Axe Plateau • Corniche Ouest',
          deliveriesCount: 0,
          averageTimeMinutes: 18,
          barColor: 'green'
        }
      ]);
    }

    const mapCor = new Map<string, number>();
    orders.forEach(o => {
      const name = `Axe ${o.establishmentDistrict}`;
      mapCor.set(name, (mapCor.get(name) || 0) + 1);
    });

    const list: LogisticsCorridor[] = [];
    let i = 1;
    mapCor.forEach((count, name) => {
      list.push({
        id: `cor-${i++}`,
        name,
        deliveriesCount: count,
        averageTimeMinutes: 15,
        barColor: 'green'
      });
    });

    return of(list);
  }

  selectOrder(order: Order | null): void {
    this.selectedSubject.next(order);
  }

  filterOrders(
    tab: OrderFilterTab,
    searchQuery: string,
    paymentMethod: string,
    zone: string
  ): Observable<Order[]> {
    let params = new HttpParams();

    if (searchQuery && searchQuery.trim().length > 0) {
      params = params.set('search', searchQuery.trim());
    }

    if (tab === 'EN_LIVRAISON') {
      params = params.set('statut', 'EN_LIVRAISON');
    } else if (tab === 'PRETES') {
      params = params.set('statut', 'PRETE');
    } else if (tab === 'LIVREES') {
      params = params.set('statut', 'LIVREE');
    } else if (tab === 'ANNULEES') {
      params = params.set('statut', 'ANNULEE');
    }

    const url = `${environment.apiUrl}/api/admin/orders/`;

    return this.http.get<any>(url, { params }).pipe(
      map(res => {
        const rawItems: any[] = Array.isArray(res) ? res : (res.results || []);
        let items = rawItems.map(mapBackendOrderToOrder);

        items = items.filter(item => {
          let matchTab = true;
          if (tab === 'EN_COURS') {
            matchTab = item.status === 'EN_PREPARATION' || item.status === 'PRETE' || item.status === 'EN_LIVRAISON';
          } else if (tab === 'A_PREPARER') {
            matchTab = item.status === 'A_PREPARER' || item.status === 'EN_PREPARATION';
          }

          let matchPayment = true;
          if (paymentMethod && paymentMethod !== '' && paymentMethod !== 'Tous') {
            matchPayment = item.payment.method.toLowerCase().includes(paymentMethod.toLowerCase()) ||
                           item.payment.methodLabel.toLowerCase().includes(paymentMethod.toLowerCase());
          }

          let matchZone = true;
          if (zone && zone !== '' && zone !== 'Tout Dakar') {
            matchZone = item.establishmentDistrict.toLowerCase().includes(zone.toLowerCase()) ||
                        item.client.deliveryAddress.toLowerCase().includes(zone.toLowerCase());
          }

          return matchTab && matchPayment && matchZone;
        });

        this.ordersSubject.next(items);

        const currentSelected = this.selectedSubject.getValue();
        if (items.length > 0) {
          if (!currentSelected || !items.some(o => o.id === currentSelected.id)) {
            this.selectedSubject.next(items[0]);
          }
        } else {
          this.selectedSubject.next(null);
        }

        return items;
      }),
      catchError(err => {
        console.error('Erreur chargement commandes admin:', err);
        return of([]);
      })
    );
  }

  updateOrderStatus(orderId: string, newStatus: OrderStatus): Observable<Order | null> {
    const url = `${environment.apiUrl}/api/admin/orders/${orderId}/status/`;
    return this.http.patch<any>(url, { statut: newStatus }).pipe(
      map(raw => {
        const updated = mapBackendOrderToOrder(raw);
        const currentOrders = this.ordersSubject.getValue().map(o => o.id === orderId ? updated : o);
        this.ordersSubject.next(currentOrders);

        if (this.selectedSubject.getValue()?.id === orderId) {
          this.selectedSubject.next(updated);
        }
        return updated;
      }),
      catchError(err => {
        console.error('Erreur mise à jour statut commande:', err);
        return of(null);
      })
    );
  }

  assignDriver(orderId: string, driverId: string): Observable<Order | null> {
    const url = `${environment.apiUrl}/api/admin/orders/${orderId}/assign-driver/`;
    return this.http.post<any>(url, { driver_id: Number(driverId) }).pipe(
      map(raw => {
        const updated = mapBackendOrderToOrder(raw);
        const currentOrders = this.ordersSubject.getValue().map(o => o.id === orderId ? updated : o);
        this.ordersSubject.next(currentOrders);

        if (this.selectedSubject.getValue()?.id === orderId) {
          this.selectedSubject.next(updated);
        }
        return updated;
      }),
      catchError(err => {
        console.error('Erreur assignation livreur commande:', err);
        return of(null);
      })
    );
  }

  exportCsv(): void {
    console.log('Exporter le relevé (CSV) déclenché');
  }

  reconciliation(): void {
    console.log('Rapprochement bancaire déclenché');
  }
}
