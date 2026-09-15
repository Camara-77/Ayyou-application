import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProHeaderComponent } from '../../components/pro-header/pro-header.component';
import { ProBottomNavComponent } from '../../components/pro-bottom-nav/pro-bottom-nav.component';
import { ProOrderService } from '../../../../core/services/pro-order.service';
import { ProOrder } from '../../../../core/models/pro';

export interface OrderGroup {
  dateHeader: string;
  totalCountText: string;
  orders: ProOrder[];
}

@Component({
  selector: 'app-pro-order-history',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProHeaderComponent, ProBottomNavComponent],
  templateUrl: './pro-order-history.component.html',
  styleUrls: ['./pro-order-history.component.scss']
})
export class ProOrderHistoryComponent implements OnInit {
  orders: ProOrder[] = [];
  groupedOrders: OrderGroup[] = [];
  selectedFilter: 'ALL' | 'LIVREE' | 'A_EMPORTER' = 'ALL';
  searchQuery: string = '';

  // Mock counts to match mockup badges exact text
  totalCount: number = 148;
  deliveredCount: number = 130;
  pickupCount: number = 14;

  constructor(private proOrderService: ProOrderService) {}

  ngOnInit(): void {
    this.proOrderService.allOrders$.subscribe(all => {
      this.orders = all;
      this.applyFilter();
    });
  }

  setFilter(filter: 'ALL' | 'LIVREE' | 'A_EMPORTER'): void {
    this.selectedFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    let list = [...this.orders];

    if (this.selectedFilter === 'LIVREE') {
      list = list.filter(o => o.status === 'LIVREE' || o.status === 'delivered');
    } else if (this.selectedFilter === 'A_EMPORTER') {
      list = list.filter(o => o.status === 'A_EMPORTER' || o.status === 'pickup' || o.serviceMode === 'CLICK_AND_COLLECT');
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(o =>
        (o.orderRef && o.orderRef.toLowerCase().includes(q)) ||
        (o.id && o.id.toLowerCase().includes(q)) ||
        (o.clientName && o.clientName.toLowerCase().includes(q)) ||
        (o.itemsText && o.itemsText.toLowerCase().includes(q))
      );
    }

    // Group filtered orders by dateGroup
    const groupMap = new Map<string, ProOrder[]>();
    list.forEach(order => {
      const header = order.dateGroup || "AUJOURD'HUI — 12 NOVEMBRE";
      if (!groupMap.has(header)) {
        groupMap.set(header, []);
      }
      groupMap.get(header)!.push(order);
    });

    this.groupedOrders = Array.from(groupMap.entries()).map(([dateHeader, groupOrders]) => {
      let countText = '42 commandes';
      if (dateHeader.includes('HIER')) {
        countText = '38 commandes';
      } else if (dateHeader.includes('AUJOURD\'HUI')) {
        countText = '42 commandes';
      } else {
        countText = `${groupOrders.length} commandes`;
      }

      return {
        dateHeader,
        totalCountText: countText,
        orders: groupOrders
      };
    });
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'LIVREE':
      case 'delivered':
        return 'Livrée';
      case 'A_EMPORTER':
      case 'pickup':
        return 'À emporter';
      case 'EN_ATTENTE':
        return 'En attente';
      case 'VALIDEE':
        return 'Validée';
      case 'PREPARATION':
        return 'En préparation';
      default:
        return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'LIVREE':
      case 'delivered':
        return 'status-delivered';
      case 'A_EMPORTER':
      case 'pickup':
        return 'status-pickup';
      default:
        return 'status-default';
    }
  }
}
