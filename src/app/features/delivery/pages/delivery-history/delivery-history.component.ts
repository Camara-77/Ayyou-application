import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DeliveryService } from '../../../../core/services/delivery.service';
import { Livraison } from '../../../../core/models/delivery';
import { DriverAuthService } from '../../services/driver-auth.service';
import { DeliveryBottomNavComponent } from '../../components/delivery-bottom-nav/delivery-bottom-nav.component';
import { DeliveryHeaderComponent } from '../../components/delivery-header/delivery-header.component';

@Component({
  selector: 'app-delivery-history',
  standalone: true,
  imports: [CommonModule, RouterModule, DeliveryBottomNavComponent, DeliveryHeaderComponent],
  templateUrl: './delivery-history.component.html',
  styleUrl: './delivery-history.component.scss'
})
export class DeliveryHistoryComponent implements OnInit {
  private deliveryService = inject(DeliveryService);
  private driverAuthService = inject(DriverAuthService);

  deliveries: Livraison[] = [];
  filteredDeliveries: Livraison[] = [];
  activeFilter: 'ALL' | 'LIVREE' | 'ANNULEE' = 'ALL';
  isLoading = true;
  errorMessage = '';

  totalGains = 0;
  completedCount = 0;

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.deliveryService.getDeliveries().subscribe({
      next: (allDeliveries) => {
        this.isLoading = false;
        // Filter finished deliveries (LIVREE or ANNULEE)
        this.deliveries = (allDeliveries || []).filter(
          d => d.statut === 'LIVREE' || d.statut === 'ANNULEE'
        );
        this.calculateStats();
        this.applyFilter();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = "Impossible de charger l'historique des courses.";
      }
    });
  }

  calculateStats(): void {
    const delivered = this.deliveries.filter(d => d.statut === 'LIVREE');
    this.completedCount = delivered.length;
    this.totalGains = delivered.reduce((sum, d) => {
      const val = parseInt(d.frais_livraison || '0', 10);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  }

  setFilter(filter: 'ALL' | 'LIVREE' | 'ANNULEE'): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.activeFilter === 'LIVREE') {
      this.filteredDeliveries = this.deliveries.filter(d => d.statut === 'LIVREE');
    } else if (this.activeFilter === 'ANNULEE') {
      this.filteredDeliveries = this.deliveries.filter(d => d.statut === 'ANNULEE');
    } else {
      this.filteredDeliveries = [...this.deliveries];
    }
  }

  getEtablissementName(delivery: Livraison): string {
    if (delivery.etablissements && delivery.etablissements.length > 0) {
      return delivery.etablissements.map(e => e.nom).join(', ');
    }
    return 'Établissement AYYOU';
  }

  getFormattedGain(delivery: Livraison): string {
    const raw = parseInt(delivery.frais_livraison || '0', 10);
    const val = isNaN(raw) ? 0 : raw;
    return val.toLocaleString('fr-FR') + ' CFA';
  }

  getFormattedDate(dateStr?: string): string {
    if (!dateStr) return 'Date non spécifiée';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
