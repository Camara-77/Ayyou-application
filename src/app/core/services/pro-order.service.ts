import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ProOrder } from '../models/pro';

@Injectable({
  providedIn: 'root'
})
export class ProOrderService {
  private initialOrders: ProOrder[] = [
    {
      id: 'ORD-9482',
      orderRef: 'AY-9482',
      type: 'delivery',
      serviceMode: 'LIVRAISON',
      isUrgent: false,
      status: 'LIVREE',
      clientName: 'Amadou Diallo',
      deliveryAddress: 'Avenue Cheikh Anta Diop, Fann Hock',
      timeAgo: 'Il y a 35 min',
      timeFormatted: '13:45',
      dateGroup: "AUJOURD'HUI — 12 NOVEMBRE",
      createdAt: new Date().toISOString(),
      itemsText: '1x Thiéboudienne Rouge Royale, 1x Yassa Poulet, 1x Bissap Royal',
      items: [
        { name: 'Thiéboudienne Rouge Royale', quantity: 1, totalPrice: 4500 },
        { name: 'Yassa Poulet', quantity: 1, totalPrice: 5000 },
        { name: 'Bissap Royal', quantity: 1, totalPrice: 2000 }
      ],
      paymentMethodText: 'Payé via Wave',
      paymentDotClass: 'dot-green',
      totalPrice: 11500,
      totalAmount: 11500
    },
    {
      id: 'ORD-9478',
      orderRef: 'AY-9478',
      type: 'pickup',
      serviceMode: 'CLICK_AND_COLLECT',
      isUrgent: false,
      status: 'A_EMPORTER',
      clientName: 'Fatou Sall',
      deliveryAddress: 'Comptoir Chez Loutcha',
      timeAgo: 'Il y a 1h 15min',
      timeFormatted: '12:30',
      dateGroup: "AUJOURD'HUI — 12 NOVEMBRE",
      createdAt: new Date().toISOString(),
      itemsText: '2x Thiéboudienne Rouge, 2x Pastels Thon',
      items: [
        { name: 'Thiéboudienne Rouge', quantity: 2, totalPrice: 7000 },
        { name: 'Pastels Thon', quantity: 2, totalPrice: 4000 }
      ],
      paymentMethodText: 'Payé comptoir / Wave',
      paymentDotClass: 'dot-orange',
      totalPrice: 11000,
      totalAmount: 11000
    },
    {
      id: 'ORD-9475',
      orderRef: 'AY-9475',
      type: 'delivery',
      serviceMode: 'LIVRAISON',
      isUrgent: false,
      status: 'LIVREE',
      clientName: 'Ousmane Ba',
      deliveryAddress: 'Almadies, Dakar',
      timeAgo: 'Hier 20:15',
      timeFormatted: '20:15',
      dateGroup: "HIER — 11 NOVEMBRE",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      itemsText: "1x Dibi d'Agneau Prestige, 1x Alloco, 2x Jus de Bouye",
      items: [
        { name: "Dibi d'Agneau Prestige", quantity: 1, totalPrice: 7500 },
        { name: 'Alloco', quantity: 1, totalPrice: 2000 },
        { name: 'Jus de Bouye', quantity: 2, totalPrice: 4000 }
      ],
      paymentMethodText: 'Orange Money',
      paymentDotClass: 'dot-green',
      totalPrice: 13500,
      totalAmount: 13500
    }
  ];

  private ordersSubject = new BehaviorSubject<ProOrder[]>(this.initialOrders);
  allOrders$: Observable<ProOrder[]> = this.ordersSubject.asObservable();
  orders$: Observable<ProOrder[]> = this.allOrders$;

  private urgentSubject = new BehaviorSubject<ProOrder[]>([]);
  urgentOrders$: Observable<ProOrder[]> = this.urgentSubject.asObservable();

  constructor() {
    this.updateUrgentList();
  }

  get orders(): ProOrder[] {
    return this.ordersSubject.value;
  }

  private updateUrgentList(): void {
    const urgent = this.ordersSubject.value.filter(o => 
      o.status === 'EN_ATTENTE' || o.status === 'VALIDEE' || o.status === 'PREPARATION' || o.status === 'PRETE' || o.status === 'pending'
    );
    this.urgentSubject.next(urgent);
  }

  updateOrderStatus(orderId: string, status: string): void {
    const current = [...this.ordersSubject.value];
    const index = current.findIndex(o => o.id === orderId);
    if (index > -1) {
      current[index] = { ...current[index], status };
      this.ordersSubject.next(current);
      this.updateUrgentList();
    }
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
}
