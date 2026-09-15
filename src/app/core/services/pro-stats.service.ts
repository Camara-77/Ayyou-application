import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ProStats } from '../models/pro';

@Injectable({
  providedIn: 'root'
})
export class ProStatsService {
  private mockStats: ProStats = {
    todayOrdersCount: 84,
    todayRevenueFcfa: 1245000,
    todayRevenue: 1245000,
    pickupOrdersCount: 8,
    urgentOrdersCount: 5,
    weekRevenueFcfa: 1245000,
    weeklyTotalRevenue: 1245000,
    totalOrdersCount: 84,
    weekOrdersCount: 84,
    averageBasket: 14820,
    acceptanceRate: 98,
    rating: 4.8,
    weeklyRevenue: [
      { day: 'Lun', amount: 120000 },
      { day: 'Mar', amount: 140000 },
      { day: 'Mer', amount: 110000 },
      { day: 'Jeu', amount: 160000 },
      { day: 'Ven', amount: 190000 },
      { day: 'Sam', amount: 200000 },
      { day: 'Dim', amount: 145000 }
    ],
    hourlyRevenue: [
      { hour: '12h', amount: 30000 },
      { hour: '13h', amount: 75000 },
      { hour: '14h', amount: 55000 },
      { hour: '15h', amount: 25000 },
      { hour: '18h', amount: 40000 },
      { hour: '19h', amount: 75000 },
      { hour: '20h', amount: 65000 }
    ],
    topDishes: [
      { name: 'Thiéboudienne Rouge', portionsSold: 42, count: 42, revenueFcfa: 252000, revenue: 252000 },
      { name: 'Yassa Poulet', portionsSold: 28, count: 28, revenueFcfa: 140000, revenue: 140000 },
      { name: 'Mafé Bœuf', portionsSold: 14, count: 14, revenueFcfa: 77000, revenue: 77000 }
    ],
    lowDemandDishes: [
      { id: 'ld1', name: 'Soupou Kandja Végétarien', ordersCount: 2, count: 2, priceFcfa: 9000 },
      { id: 'ld2', name: 'Brochettes de Poisson Capitaine', ordersCount: 1, count: 1, priceFcfa: 6500 }
    ]
  };

  getStats(): ProStats {
    return this.mockStats;
  }

  getStatsObservable(period: 'today' | 'week' | 'month' = 'today'): Observable<ProStats> {
    return of(this.mockStats);
  }
}
