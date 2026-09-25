import { inject, Injectable } from '@angular/core';
import { Observable, of, map, catchError } from 'rxjs';
import { ProStats } from '../models/pro';
import { ProfessionalService } from './professional.service';

@Injectable({
  providedIn: 'root'
})
export class ProStatsService {
  private professionalService = inject(ProfessionalService);

  private defaultStats: ProStats = {
    todayOrdersCount: 0,
    todayRevenueFcfa: 0,
    todayRevenue: 0,
    pickupOrdersCount: 0,
    urgentOrdersCount: 0,
    weekRevenueFcfa: 0,
    weeklyTotalRevenue: 0,
    totalOrdersCount: 0,
    weekOrdersCount: 0,
    averageBasket: 0,
    acceptanceRate: 100,
    rating: 5.0,
    weeklyRevenue: [
      { day: 'Lun', amount: 0 },
      { day: 'Mar', amount: 0 },
      { day: 'Mer', amount: 0 },
      { day: 'Jeu', amount: 0 },
      { day: 'Ven', amount: 0 },
      { day: 'Sam', amount: 0 },
      { day: 'Dim', amount: 0 }
    ],
    hourlyRevenue: [],
    topDishes: [],
    lowDemandDishes: []
  };

  private currentStats: ProStats = { ...this.defaultStats };

  getStats(): ProStats {
    return this.currentStats;
  }

  getStatsObservable(period: 'today' | 'week' | 'month' = 'today'): Observable<ProStats> {
    return this.professionalService.getMerchantStats().pipe(
      map(res => {
        if (!res) {
          return this.defaultStats;
        }
        const mapped: ProStats = {
          todayOrdersCount: res.todayOrdersCount || 0,
          todayRevenueFcfa: res.todayRevenueFcfa || 0,
          todayRevenue: res.todayRevenue || 0,
          pickupOrdersCount: res.pickupOrdersCount || 0,
          urgentOrdersCount: res.urgentOrdersCount || 0,
          weekRevenueFcfa: res.todayRevenueFcfa || 0,
          weeklyTotalRevenue: res.todayRevenueFcfa || 0,
          totalOrdersCount: res.todayOrdersCount || 0,
          weekOrdersCount: res.todayOrdersCount || 0,
          averageBasket: res.todayOrdersCount > 0 ? Math.round(res.todayRevenueFcfa / res.todayOrdersCount) : 0,
          acceptanceRate: 100,
          rating: res.rating || 5.0,
          weeklyRevenue: this.defaultStats.weeklyRevenue,
          hourlyRevenue: [],
          topDishes: [],
          lowDemandDishes: []
        };
        this.currentStats = mapped;
        return mapped;
      }),
      catchError(() => of(this.defaultStats))
    );
  }
}
