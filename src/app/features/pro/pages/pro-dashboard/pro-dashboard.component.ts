import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProHeaderComponent } from '../../components/pro-header/pro-header.component';
import { ProBottomNavComponent } from '../../components/pro-bottom-nav/pro-bottom-nav.component';
import { ProAuthService } from '../../../../core/services/pro-auth.service';
import { ProOrderService } from '../../../../core/services/pro-order.service';
import { ProStatsService } from '../../../../core/services/pro-stats.service';
import { ProMenuService } from '../../../../core/services/pro-menu.service';
import { ProfessionalService, BackendEtablissement, BackendProduit } from '../../../../core/services/professional.service';
import { ProProfile, ProOrder, ProStats } from '../../../../core/models/pro';

@Component({
  selector: 'app-pro-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ProHeaderComponent, ProBottomNavComponent],
  templateUrl: './pro-dashboard.component.html',
  styleUrls: ['./pro-dashboard.component.scss']
})
export class ProDashboardComponent implements OnInit {
  private proAuthService = inject(ProAuthService);
  private proOrderService = inject(ProOrderService);
  private proStatsService = inject(ProStatsService);
  public proMenuService = inject(ProMenuService);
  private professionalService = inject(ProfessionalService);

  profile!: ProProfile;
  stats!: ProStats;
  urgentOrders: ProOrder[] = [];
  selectedFilter: 'ALL' | 'PICKUP' | 'DELIVERY' = 'ALL';
  establishment: BackendEtablissement | null = null;
  products: BackendProduit[] = [];

  ngOnInit(): void {
    this.proAuthService.profile$.subscribe(p => this.profile = p);

    // Charge les statistiques réelles depuis l'API /api/pro/merchant/stats/
    this.proStatsService.getStatsObservable().subscribe(s => this.stats = s);

    this.proOrderService.urgentOrders$.subscribe(orders => this.urgentOrders = orders);

    // Charge les données réelles de l'établissement professionnel depuis Django DRF
    this.professionalService.getMyEstablishment().subscribe({
      next: (etab) => {
        this.establishment = etab;
        const mapped = this.professionalService.mapEtablissementToProfile(etab);
        this.proAuthService.updateProfile(mapped);

        // Charge les produits de l'établissement
        this.professionalService.getProducts(etab.id).subscribe({
          next: (prods) => {
            this.products = prods;
          },
          error: () => {}
        });
      },
      error: () => {}
    });
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
