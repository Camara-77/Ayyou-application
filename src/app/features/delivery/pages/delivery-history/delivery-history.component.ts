import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DeliveryBottomNavComponent } from '../../components/delivery-bottom-nav/delivery-bottom-nav.component';

export interface HistoryDeliveryItem {
  id: string;
  orderRef: string;
  time: string;
  status: 'LIVRÉE' | 'ANNULÉE';
  restaurantName: string;
  clientInfo: string;
  paymentMethod: string;
  driverGainFcfa: number;
  period: 'today' | 'week' | 'month';
}

@Component({
  selector: 'app-delivery-history',
  standalone: true,
  imports: [CommonModule, RouterModule, DeliveryBottomNavComponent],
  templateUrl: './delivery-history.component.html',
  styleUrls: ['./delivery-history.component.scss']
})
export class DeliveryHistoryComponent implements OnInit {
  currentDateLabel: string = 'Mardi 12 Nov · Dakar Centre';
  selectedPeriod: 'today' | 'week' | 'month' = 'today';
  selectedFilter: 'all' | 'completed' | 'cancelled' = 'all';

  deliveries: HistoryDeliveryItem[] = [
    {
      id: '1',
      orderRef: '#AY-9482',
      time: '13:42',
      status: 'LIVRÉE',
      restaurantName: 'Chez Loutcha',
      clientInfo: 'Amadou Diallo (Point E)',
      paymentMethod: 'Paiement Wave',
      driverGainFcfa: 1500,
      period: 'today'
    },
    {
      id: '2',
      orderRef: '#AY-9475',
      time: '12:50',
      status: 'LIVRÉE',
      restaurantName: 'Le Terrou-Bi',
      clientInfo: 'Sarah K. (Almadies)',
      paymentMethod: 'Espèces : 12 500 F',
      driverGainFcfa: 1200,
      period: 'today'
    },
    {
      id: '3',
      orderRef: '#AY-9461',
      time: '12:15',
      status: 'LIVRÉE',
      restaurantName: 'Chez Loutcha',
      clientInfo: 'Moussa Diouf (Plateau)',
      paymentMethod: 'Paiement Wave',
      driverGainFcfa: 1000,
      period: 'today'
    },
    {
      id: '4',
      orderRef: '#AY-9448',
      time: '11:30',
      status: 'LIVRÉE',
      restaurantName: 'Dibiterie Haoussa',
      clientInfo: 'Ousmane B. (Fann)',
      paymentMethod: 'Paiement Wave',
      driverGainFcfa: 1000,
      period: 'today'
    }
  ];

  constructor(
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {}

  goBack(): void {
    this.location.back();
  }

  setPeriod(period: 'today' | 'week' | 'month'): void {
    this.selectedPeriod = period;
  }

  setFilter(filter: 'all' | 'completed' | 'cancelled'): void {
    this.selectedFilter = filter;
  }

  get filteredDeliveries(): HistoryDeliveryItem[] {
    return this.deliveries.filter(item => {
      const matchesPeriod = item.period === this.selectedPeriod;
      if (this.selectedFilter === 'completed') {
        return matchesPeriod && item.status === 'LIVRÉE';
      }
      if (this.selectedFilter === 'cancelled') {
        return matchesPeriod && item.status === 'ANNULÉE';
      }
      return matchesPeriod;
    });
  }

  get totalCount(): number {
    return this.deliveries.filter(d => d.period === this.selectedPeriod).length;
  }

  get completedCount(): number {
    return this.deliveries.filter(d => d.period === this.selectedPeriod && d.status === 'LIVRÉE').length;
  }

  get cancelledCount(): number {
    return this.deliveries.filter(d => d.period === this.selectedPeriod && d.status === 'ANNULÉE').length;
  }

  get totalCaisseFcfa(): string {
    const total = this.filteredDeliveries
      .filter(d => d.status === 'LIVRÉE')
      .reduce((sum, item) => sum + item.driverGainFcfa, 0);
    
    // Format nicely e.g. 25 500 F
    return total.toLocaleString('fr-FR') + ' F';
  }

  closeDailyCaisse(): void {
    alert(`Clôture de la caisse journalière (${this.totalCaisseFcfa}) en cours...`);
  }

  downloadPdfReport(): void {
    alert('Génération et téléchargement du relevé PDF (12 Nov)...');
  }
}
