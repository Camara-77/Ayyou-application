import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  LogisticsCorridor,
  Order,
  OrderFilterTab,
  OrderStatsSummary,
  OrderStatus
} from '../models/admin-order.models';

@Injectable({
  providedIn: 'root'
})
export class AdminOrderService {
  private mockOrders: Order[] = [
    {
      id: 'o-1094',
      reference: '#AYY-1094',
      timeAgo: 'il y a 6 min',
      createdTime: '12:44',
      estimatedTime: '13:12',
      client: {
        id: 'c-1094',
        name: 'Fatou Bintou Sall',
        phone: '+221 77 340 12 88',
        deliveryAddress: 'Résidence Les Almadies, Entrée B, Apt 302, Dakar'
      },
      establishmentName: 'Chez Loutcha',
      establishmentDistrict: 'Plateau',
      isMultiVendor: false,
      amountFormatted: '9 500 FCFA',
      articlesCount: 3,
      status: 'EN_LIVRAISON',
      statusText: 'En cours de route',
      statusDotColor: 'blue',
      subOrders: [
        {
          id: 'so-1094',
          establishmentName: 'Chez Loutcha',
          establishmentTypeLabel: 'RESTAURATEUR',
          address: '101 Rue Carnot, Dakar Plateau',
          phone: '+221 33 821 03 08',
          subtotalFormatted: '9 500 FCFA',
          items: [
            {
              id: 'i-1',
              name: 'Thiébouddienne Rouge Penda Mbaye',
              quantity: 1,
              priceFormatted: '4 500 FCFA',
              priceAmount: 4500,
              description: 'Riz rouge, Mérou blanc thiof, légumes'
            },
            {
              id: 'i-2',
              name: 'Yassa au Poulet Braisé Fermier',
              quantity: 1,
              priceFormatted: '3 500 FCFA',
              priceAmount: 3500,
              description: 'Oignons confits, citron vert, riz blanc'
            },
            {
              id: 'i-3',
              name: 'Jus de Bissap Royal Menthe Fraîche 50cl',
              quantity: 2,
              priceFormatted: '1 500 FCFA',
              priceAmount: 1500,
              description: 'Recette artisanale infusée'
            }
          ]
        }
      ],
      payment: {
        id: 'p-1094',
        method: 'WAVE',
        methodLabel: 'Wave',
        reference: '#WV-8831',
        status: 'PAYE',
        statusText: 'Validé Wave Instantané • Reçu #WV-8831',
        subtotalFormatted: '9 500 FCFA',
        deliveryFeeFormatted: '1 500 FCFA (Zone Plateau ➔ Almadies)',
        totalPaidFormatted: '11 000 FCFA',
        driverPayoutFormatted: '1 500 FCFA',
        merchantPayoutFormatted: '9 500 FCFA',
        commissionNote: '0% commission • Modèle AYYOU Abonnement Pro'
      },
      delivery: {
        id: 'd-1094',
        driverName: 'Ibrahima Sow',
        driverPhone: '+221 77 541 20 90',
        driverVehicle: 'Yamaha Crypton DK-8492-AB',
        distanceFromClientText: 'À 450m du client',
        statusText: 'En cours de route'
      }
    },
    {
      id: 'o-1093',
      reference: '#AYY-1093',
      timeAgo: 'il y a 14 min',
      createdTime: '12:36',
      estimatedTime: '13:05',
      client: {
        id: 'c-1093',
        name: 'Oumar Sy',
        phone: '+221 78 119 54 20',
        deliveryAddress: 'Route des Almadies, en face Ngor, Dakar'
      },
      establishmentName: 'Burger Black Bun',
      establishmentDistrict: 'Almadies',
      isMultiVendor: false,
      amountFormatted: '14 200 FCFA',
      articlesCount: 2,
      status: 'EN_PREPARATION',
      statusText: 'En préparation',
      statusDotColor: 'orange',
      subOrders: [
        {
          id: 'so-1093',
          establishmentName: 'Burger Black Bun',
          establishmentTypeLabel: 'RESTAURATEUR',
          address: 'Zone des Almadies, Dakar',
          phone: '+221 33 860 12 12',
          subtotalFormatted: '14 200 FCFA',
          items: [
            {
              id: 'i-4',
              name: 'Double Cheeseburger Beef Angus',
              quantity: 2,
              priceFormatted: '10 000 FCFA',
              priceAmount: 10000,
              description: 'Pain au charbon végétal, cheddar affiné'
            },
            {
              id: 'i-5',
              name: 'Frites de Patate Douce XL',
              quantity: 1,
              priceFormatted: '4 200 FCFA',
              priceAmount: 4200,
              description: 'Sauce maison barbecue fumée'
            }
          ]
        }
      ],
      payment: {
        id: 'p-1093',
        method: 'ORANGE_MONEY',
        methodLabel: 'Orange Money',
        reference: '#OM-4410',
        status: 'PAYE',
        statusText: 'Validé Orange Money • Reçu #OM-4410',
        subtotalFormatted: '14 200 FCFA',
        deliveryFeeFormatted: '1 000 FCFA',
        totalPaidFormatted: '15 200 FCFA',
        driverPayoutFormatted: '1 000 FCFA',
        merchantPayoutFormatted: '14 200 FCFA',
        commissionNote: '0% commission • Modèle AYYOU Abonnement Pro'
      },
      delivery: {
        id: 'd-1093',
        driverName: 'Mamadou Ndiaye',
        driverPhone: '+221 77 632 11 00',
        driverVehicle: 'Scooter Kymco Agility DK-1029-BC',
        distanceFromClientText: 'À 1.2km du client',
        statusText: 'Attente coursier'
      }
    },
    {
      id: 'o-1092',
      reference: '#AYY-1092',
      timeAgo: 'il y a 22 min',
      createdTime: '12:28',
      estimatedTime: '12:55',
      client: {
        id: 'c-1092',
        name: 'Mariama Ba',
        phone: '+221 76 502 99 11',
        deliveryAddress: 'Av. Cheikh Anta Diop, Fann Residence, Dakar'
      },
      establishmentName: 'Touba Primeurs & Bio',
      establishmentDistrict: 'Mermoz',
      isMultiVendor: false,
      amountFormatted: '18 500 FCFA',
      articlesCount: 4,
      status: 'PRETE',
      statusText: 'Prête',
      statusDotColor: 'green',
      subOrders: [
        {
          id: 'so-1092',
          establishmentName: 'Touba Primeurs & Bio',
          establishmentTypeLabel: 'COMMERCE',
          address: 'Avenue Cheikh Anta Diop, Mermoz',
          phone: '+221 33 825 40 40',
          subtotalFormatted: '18 500 FCFA',
          items: [
            {
              id: 'i-6',
              name: 'Panier Mangues Kent Bio (5kg)',
              quantity: 1,
              priceFormatted: '8 500 FCFA',
              priceAmount: 8500,
              description: 'Origine Niayes dakarois'
            },
            {
              id: 'i-7',
              name: 'Miel Sauvage de Casamance 500g',
              quantity: 2,
              priceFormatted: '10 000 FCFA',
              priceAmount: 10000,
              description: 'Récolte artisanale naturelle'
            }
          ]
        }
      ],
      payment: {
        id: 'p-1092',
        method: 'WAVE',
        methodLabel: 'Wave',
        reference: '#WV-8820',
        status: 'PAYE',
        statusText: 'Validé Wave Instantané • Reçu #WV-8820',
        subtotalFormatted: '18 500 FCFA',
        deliveryFeeFormatted: '1 200 FCFA',
        totalPaidFormatted: '19 700 FCFA',
        driverPayoutFormatted: '1 200 FCFA',
        merchantPayoutFormatted: '18 500 FCFA',
        commissionNote: '0% commission • Modèle AYYOU Abonnement Pro'
      },
      delivery: {
        id: 'd-1092',
        driverName: 'Cheikh Tidiane Gaye',
        driverPhone: '+221 77 210 88 77',
        driverVehicle: 'Tricycle Boxer DK-4455-CD',
        distanceFromClientText: 'À 800m du vendeur',
        statusText: 'Prête pour ramassage'
      }
    },
    {
      id: 'o-1091',
      reference: '#AYY-1091',
      timeAgo: 'il y a 35 min',
      createdTime: '12:15',
      estimatedTime: '12:45',
      client: {
        id: 'c-1091',
        name: 'Abdoulaye Diallo',
        phone: '+221 77 601 22 45',
        deliveryAddress: 'Cité Keur Gorgui, Immeuble B2, Dakar'
      },
      establishmentName: "L'Atelier du Choukouya",
      establishmentDistrict: 'Ouakam',
      isMultiVendor: false,
      amountFormatted: '22 000 FCFA',
      articlesCount: 3,
      status: 'EN_LIVRAISON',
      statusText: 'En livraison',
      statusDotColor: 'blue',
      subOrders: [
        {
          id: 'so-1091',
          establishmentName: "L'Atelier du Choukouya",
          establishmentTypeLabel: 'RESTAURATEUR',
          address: 'Route de Ouakam, Dakar',
          phone: '+221 33 864 55 99',
          subtotalFormatted: '22 000 FCFA',
          items: [
            {
              id: 'i-8',
              name: 'Choukouya d\'Agneau Grillé au Feu de Bois (1kg)',
              quantity: 1,
              priceFormatted: '16 000 FCFA',
              priceAmount: 16000,
              description: 'Épices kankan, oignons, piment'
            },
            {
              id: 'i-9',
              name: 'Alloco Banane Plantain Frite',
              quantity: 2,
              priceFormatted: '6 000 FCFA',
              priceAmount: 6000,
              description: 'Portion généreuse'
            }
          ]
        }
      ],
      payment: {
        id: 'p-1091',
        method: 'WAVE',
        methodLabel: 'Wave',
        reference: '#WV-8815',
        status: 'PAYE',
        statusText: 'Validé Wave Instantané • Reçu #WV-8815',
        subtotalFormatted: '22 000 FCFA',
        deliveryFeeFormatted: '1 500 FCFA',
        totalPaidFormatted: '23 500 FCFA',
        driverPayoutFormatted: '1 500 FCFA',
        merchantPayoutFormatted: '22 000 FCFA',
        commissionNote: '0% commission • Modèle AYYOU Abonnement Pro'
      },
      delivery: {
        id: 'd-1091',
        driverName: 'Babacar Diop',
        driverPhone: '+221 77 889 00 11',
        driverVehicle: 'TVS HLX 150cc DK-7788-DE',
        distanceFromClientText: 'À 300m du client',
        statusText: 'En cours de livraison'
      }
    },
    {
      id: 'o-1090',
      reference: '#AYY-1090',
      timeAgo: 'il y a 48 min',
      createdTime: '12:02',
      estimatedTime: '12:35',
      client: {
        id: 'c-1090',
        name: 'Cheikh Anta Kane',
        phone: '+221 77 410 88 02',
        deliveryAddress: 'Point E, Rue 4 x Boulevard Sud, Dakar'
      },
      establishmentName: 'Le Relais de la Corniche',
      establishmentDistrict: 'Fann',
      isMultiVendor: false,
      amountFormatted: '36 500 FCFA',
      articlesCount: 5,
      status: 'LIVREE',
      statusText: 'Livrée',
      statusDotColor: 'green',
      subOrders: [
        {
          id: 'so-1090',
          establishmentName: 'Le Relais de la Corniche',
          establishmentTypeLabel: 'RESTAURATEUR',
          address: 'Corniche Ouest, Fann Dakar',
          phone: '+221 33 823 10 10',
          subtotalFormatted: '36 500 FCFA',
          items: [
            {
              id: 'i-10',
              name: 'Filet de Capitaine Sauce Vierge',
              quantity: 2,
              priceFormatted: '24 000 FCFA',
              priceAmount: 24000,
              description: 'Légumes croquants vapeur'
            },
            {
              id: 'i-11',
              name: 'Tarte Fine aux Pommes & Glace Vanille',
              quantity: 2,
              priceFormatted: '12 500 FCFA',
              priceAmount: 12500,
              description: 'Dessert maison'
            }
          ]
        }
      ],
      payment: {
        id: 'p-1090',
        method: 'CARTE_BANCAIRE',
        methodLabel: 'Carte Bancaire',
        reference: '#CB-9021',
        status: 'PAYE',
        statusText: 'Validé Carte Visa • Reçu #CB-9021',
        subtotalFormatted: '36 500 FCFA',
        deliveryFeeFormatted: '2 000 FCFA',
        totalPaidFormatted: '38 500 FCFA',
        driverPayoutFormatted: '2 000 FCFA',
        merchantPayoutFormatted: '36 500 FCFA',
        commissionNote: '0% commission • Modèle AYYOU Abonnement Pro'
      },
      delivery: {
        id: 'd-1090',
        driverName: 'Pathé Seck',
        driverPhone: '+221 77 333 44 55',
        driverVehicle: 'Honda PCX 150cc DK-9900-FF',
        distanceFromClientText: 'Livré au client à 12:34',
        statusText: 'Livrée avec succès'
      }
    }
  ];

  private mockCorridors: LogisticsCorridor[] = [
    {
      id: 'cor-1',
      name: 'Axe Plateau • Corniche Ouest',
      deliveriesCount: 32,
      averageTimeMinutes: 18,
      barColor: 'green'
    },
    {
      id: 'cor-2',
      name: 'Zone Almadies • Ngor',
      deliveriesCount: 19,
      averageTimeMinutes: 14,
      barColor: 'green'
    },
    {
      id: 'cor-3',
      name: 'Ceinture Mermoz • Ouakam',
      deliveriesCount: 7,
      averageTimeMinutes: 11,
      barColor: 'green'
    }
  ];

  private ordersSubject = new BehaviorSubject<Order[]>(this.mockOrders);
  private selectedSubject = new BehaviorSubject<Order | null>(this.mockOrders[0]);

  orders$ = this.ordersSubject.asObservable();
  selectedOrder$ = this.selectedSubject.asObservable();

  getStatsSummary(): Observable<OrderStatsSummary> {
    return of({
      todayCount: 1240,
      todayVolumeFormatted: 'Volume: 14 850 000 FCFA',
      preparingCount: 38,
      deliveringCount: 58,
      deliveredCount: 1129,
      deliveredSuccessRate: '98.6%',
      canceledCount: 15,
      canceledAuditRate: '1.2% • à auditer'
    });
  }

  getCorridors(): Observable<LogisticsCorridor[]> {
    return of(this.mockCorridors);
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
    return this.orders$.pipe(
      map(items => {
        return items.filter(item => {
          // Tab Filter
          let matchTab = true;
          if (tab === 'EN_COURS') {
            matchTab = item.status === 'EN_PREPARATION' || item.status === 'PRETE' || item.status === 'EN_LIVRAISON';
          } else if (tab === 'A_PREPARER') {
            matchTab = item.status === 'A_PREPARER' || item.status === 'EN_PREPARATION';
          } else if (tab === 'PRETES') {
            matchTab = item.status === 'PRETE';
          } else if (tab === 'EN_LIVRAISON') {
            matchTab = item.status === 'EN_LIVRAISON';
          } else if (tab === 'LIVREES') {
            matchTab = item.status === 'LIVREE';
          } else if (tab === 'ANNULEES') {
            matchTab = item.status === 'ANNULEE' || item.status === 'LITIGE';
          }

          // Search Filter
          let matchSearch = true;
          if (searchQuery && searchQuery.trim().length > 0) {
            const q = searchQuery.toLowerCase().trim();
            const ref = item.reference.toLowerCase();
            const clientName = item.client.name.toLowerCase();
            const clientPhone = item.client.phone.toLowerCase();
            const estName = item.establishmentName.toLowerCase();
            matchSearch = ref.includes(q) || clientName.includes(q) || clientPhone.includes(q) || estName.includes(q);
          }

          // Payment Filter
          let matchPayment = true;
          if (paymentMethod && paymentMethod !== '' && paymentMethod !== 'Tous') {
            matchPayment = item.payment.method.toLowerCase().includes(paymentMethod.toLowerCase()) ||
                           item.payment.methodLabel.toLowerCase().includes(paymentMethod.toLowerCase());
          }

          // Zone Filter
          let matchZone = true;
          if (zone && zone !== '' && zone !== 'Tout Dakar') {
            matchZone = item.establishmentDistrict.toLowerCase().includes(zone.toLowerCase()) ||
                        item.client.deliveryAddress.toLowerCase().includes(zone.toLowerCase());
          }

          return matchTab && matchSearch && matchPayment && matchZone;
        });
      })
    );
  }

  updateOrderStatus(orderId: string, newStatus: OrderStatus): void {
    const currentOrders = [...this.ordersSubject.value];
    const target = currentOrders.find(o => o.id === orderId);
    if (target) {
      target.status = newStatus;
      if (newStatus === 'EN_LIVRAISON') {
        target.statusText = 'En cours de route';
        target.statusDotColor = 'blue';
      } else if (newStatus === 'LIVREE') {
        target.statusText = 'Livrée';
        target.statusDotColor = 'green';
      } else if (newStatus === 'ANNULEE') {
        target.statusText = 'Annulée';
        target.statusDotColor = 'red';
      }
      this.ordersSubject.next(currentOrders);
      if (this.selectedSubject.value?.id === orderId) {
        this.selectedSubject.next({ ...target });
      }
    }
  }

  assignDriver(orderId: string, driverName: string): void {
    const currentOrders = [...this.ordersSubject.value];
    const target = currentOrders.find(o => o.id === orderId);
    if (target) {
      target.delivery.driverName = driverName;
      target.delivery.driverPhone = '+221 77 541 20 90';
      target.delivery.driverVehicle = 'Yamaha Crypton DK-8492-AB';
      target.delivery.distanceFromClientText = 'À 450m du client';
      this.ordersSubject.next(currentOrders);
      if (this.selectedSubject.value?.id === orderId) {
        this.selectedSubject.next({ ...target });
      }
    }
  }

  exportCsv(): void {
    console.log('Exporter le relevé (CSV) déclenché');
  }

  reconciliation(): void {
    console.log('Rapprochement bancaire déclenché');
  }
}
