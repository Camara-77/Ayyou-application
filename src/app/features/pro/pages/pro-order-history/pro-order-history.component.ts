import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProHeaderComponent } from '../../components/pro-header/pro-header.component';
import { ProBottomNavComponent } from '../../components/pro-bottom-nav/pro-bottom-nav.component';
import { ProOrderService } from '../../../../core/services/pro-order.service';
import { ProfessionalService } from '../../../../core/services/professional.service';
import { ProAuthService } from '../../../../core/services/pro-auth.service';
import { ProOrder, ProfessionalProfile } from '../../../../core/models/pro';

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
  private proOrderService = inject(ProOrderService);
  private professionalService = inject(ProfessionalService);
  private proAuthService = inject(ProAuthService);

  profile!: ProfessionalProfile;
  orders: ProOrder[] = [];
  groupedOrders: OrderGroup[] = [];
  selectedFilter: 'ALL' | 'LIVREE' | 'A_EMPORTER' = 'ALL';
  searchQuery: string = '';

  totalCount: number = 0;
  deliveredCount: number = 0;
  pickupCount: number = 0;

  ngOnInit(): void {
    this.proAuthService.profile$.subscribe(p => this.profile = p);
    this.proOrderService.allOrders$.subscribe(all => {
      this.orders = all;
      this.applyFilter();
    });

    this.professionalService.getVendorOrders().subscribe({
      next: (backendOrders) => {
        if (backendOrders && backendOrders.length > 0) {
          const mappedOrders: ProOrder[] = backendOrders.map(b => ({
            id: b.id.toString(),
            orderRef: b.numero_commande || `AY-${b.id}`,
            status: b.statut || 'LIVREE',
            clientName: b.nom_destinataire || 'Client AYYOU',
            deliveryAddress: b.adresse_livraison,
            totalPrice: parseInt(b.total || '0', 10),
            createdAt: b.date_creation,
            dateGroup: "AUJOURD'HUI — " + new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }).toUpperCase()
          }));
          this.orders = mappedOrders;
          this.applyFilter();
        }
      },
      error: () => {}
    });
  }

  setFilter(filter: 'ALL' | 'LIVREE' | 'A_EMPORTER'): void {
    this.selectedFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    this.totalCount = this.orders.length;
    this.deliveredCount = this.orders.filter(o => o.status === 'LIVREE' || o.status === 'delivered' || o.status === 'PAYEE').length;
    this.pickupCount = this.orders.filter(o => o.status === 'A_EMPORTER' || o.type === 'pickup' || o.serviceMode === 'CLICK_AND_COLLECT').length;

    let list = [...this.orders];

    if (this.selectedFilter === 'LIVREE') {
      list = list.filter(o => o.status === 'LIVREE' || o.status === 'delivered');
    } else if (this.selectedFilter === 'A_EMPORTER') {
      list = list.filter(o => o.status === 'A_EMPORTER' || o.type === 'pickup' || o.serviceMode === 'CLICK_AND_COLLECT');
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
      const header = order.dateGroup || "Commandes";
      if (!groupMap.has(header)) {
        groupMap.set(header, []);
      }
      groupMap.get(header)!.push(order);
    });

    this.groupedOrders = Array.from(groupMap.entries()).map(([dateHeader, groupOrders]) => {
      const countText = `${groupOrders.length} commande${groupOrders.length > 1 ? 's' : ''}`;
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
