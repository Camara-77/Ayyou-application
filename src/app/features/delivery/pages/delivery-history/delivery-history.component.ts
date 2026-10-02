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

  timeFilter: 'TODAY' | 'WEEK' | 'MONTH' = 'TODAY';
  statusFilter: 'ALL' | 'LIVREE' | 'ANNULEE' = 'ALL';

  isLoading = true;
  errorMessage = '';

  totalGains = 0;
  totalCaisse = 0;
  completedCount = 0;
  cancelledCount = 0;

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.deliveryService.getDeliveries().subscribe({
      next: (allDeliveries) => {
        this.isLoading = false;
        this.deliveries = (allDeliveries || []).filter(
          d => d.statut === 'LIVREE' || d.statut === 'ANNULEE'
        );
        this.applyFilters();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = "Impossible de charger l'historique des courses.";
      }
    });
  }

  setTimeFilter(filter: 'TODAY' | 'WEEK' | 'MONTH'): void {
    this.timeFilter = filter;
    this.applyFilters();
  }

  setStatusFilter(filter: 'ALL' | 'LIVREE' | 'ANNULEE'): void {
    this.statusFilter = filter;
    this.applyFilters();
  }

  applyFilters(): void {
    let list = [...this.deliveries];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    if (this.timeFilter === 'TODAY') {
      list = list.filter(d => {
        const dTime = new Date(d.updated_at || d.created_at).getTime();
        return dTime >= startOfToday;
      });
    } else if (this.timeFilter === 'WEEK') {
      list = list.filter(d => {
        const dTime = new Date(d.updated_at || d.created_at).getTime();
        return dTime >= startOfWeek;
      });
    } else if (this.timeFilter === 'MONTH') {
      list = list.filter(d => {
        const dTime = new Date(d.updated_at || d.created_at).getTime();
        return dTime >= startOfMonth;
      });
    }

    this.completedCount = list.filter(d => d.statut === 'LIVREE').length;
    this.cancelledCount = list.filter(d => d.statut === 'ANNULEE').length;

    const deliveredList = list.filter(d => d.statut === 'LIVREE');
    this.totalGains = deliveredList.reduce((sum, d) => {
      const val = parseInt(d.frais_livraison || '0', 10);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    this.totalCaisse = deliveredList.reduce((sum, d) => {
      const val = parseInt(d.total_commande || '0', 10);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    if (this.statusFilter === 'LIVREE') {
      this.filteredDeliveries = list.filter(d => d.statut === 'LIVREE');
    } else if (this.statusFilter === 'ANNULEE') {
      this.filteredDeliveries = list.filter(d => d.statut === 'ANNULEE');
    } else {
      this.filteredDeliveries = list;
    }
  }

  getEtablissementName(delivery: Livraison): string {
    if (delivery.etablissements && delivery.etablissements.length > 0) {
      return delivery.etablissements.map(e => e.nom).join(', ');
    }
    return 'Chez Loutcha';
  }

  getDestinationInfo(delivery: Livraison): string {
    const name = delivery.nom_destinataire || 'Client AYYOU';
    const address = delivery.adresse_livraison || 'Point E';
    const sector = address.split(',')[0] || address;
    return `${name} (${sector})`;
  }

  getFormattedGain(delivery: Livraison): string {
    const raw = parseInt(delivery.frais_livraison || '0', 10);
    const val = isNaN(raw) ? 1000 : raw;
    return `+${val.toLocaleString('fr-FR')} FCFA`;
  }

  getFormattedTime(dateStr?: string): string {
    if (!dateStr) return '12:00';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '12:00';
    const hours = date.getHours().toString().padStart(2, '0');
    const mins = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${mins}`;
  }

  getFormattedDateHeader(): string {
    const now = new Date();
    return now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }

  downloadPdfReport(): void {
    alert("Téléchargement du relevé de caisse PDF en cours...");
  }

  closeDailyRegister(): void {
    alert(`Clôture de la caisse journalière effectuée (${this.totalGains.toLocaleString('fr-FR')} F)`);
  }
}
