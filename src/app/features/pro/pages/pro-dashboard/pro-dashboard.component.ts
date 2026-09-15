import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProHeaderComponent } from '../../components/pro-header/pro-header.component';
import { ProBottomNavComponent } from '../../components/pro-bottom-nav/pro-bottom-nav.component';
import { ProAuthService } from '../../../../core/services/pro-auth.service';
import { ProOrderService } from '../../../../core/services/pro-order.service';
import { ProStatsService } from '../../../../core/services/pro-stats.service';
import { ProMenuService } from '../../../../core/services/pro-menu.service';
import { ProProfile, ProOrder, ProStats } from '../../../../core/models/pro';

@Component({
  selector: 'app-pro-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ProHeaderComponent, ProBottomNavComponent],
  templateUrl: './pro-dashboard.component.html',
  styleUrls: ['./pro-dashboard.component.scss']
})
export class ProDashboardComponent implements OnInit {
  profile!: ProProfile;
  stats!: ProStats;
  urgentOrders: ProOrder[] = [];
  selectedFilter: 'ALL' | 'PICKUP' | 'DELIVERY' = 'ALL';

  constructor(
    private proAuthService: ProAuthService,
    private proOrderService: ProOrderService,
    private proStatsService: ProStatsService,
    public proMenuService: ProMenuService
  ) {}

  ngOnInit(): void {
    this.proAuthService.profile$.subscribe(p => this.profile = p);
    this.stats = this.proStatsService.getStats();
    this.proOrderService.urgentOrders$.subscribe(orders => this.urgentOrders = orders);
  }

  setFilter(filter: 'ALL' | 'PICKUP' | 'DELIVERY'): void {
    this.selectedFilter = filter;
  }

  get filteredUrgentOrders(): ProOrder[] {
    if (this.selectedFilter === 'PICKUP') {
      return this.urgentOrders.filter(o => o.serviceMode === 'CLICK_AND_COLLECT' || o.type === 'pickup');
    }
    if (this.selectedFilter === 'DELIVERY') {
      return this.urgentOrders.filter(o => o.serviceMode === 'LIVRAISON' || o.type === 'delivery');
    }
    return this.urgentOrders;
  }

  updateOrderStatus(orderId: string, status: any): void {
    this.proOrderService.updateOrderStatus(orderId, status);
  }
}
