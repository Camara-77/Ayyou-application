import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderFilterTab } from '../../models/admin-order.models';

@Component({
  selector: 'app-orders-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders-filters.component.html',
  styleUrls: ['./orders-filters.component.scss']
})
export class OrdersFiltersComponent {
  @Input() selectedTab: OrderFilterTab = 'ALL';
  @Input() totalCount = 1240;
  @Input() inProgressCount = 96;
  @Input() preparingCount = 38;
  @Input() readyCount = 14;
  @Input() inDeliveryCount = 58;
  @Input() deliveredCount = 1129;
  @Input() cancelledCount = 15;

  @Output() tabChange = new EventEmitter<OrderFilterTab>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() paymentStatusChange = new EventEmitter<string>();
  @Output() corridorChange = new EventEmitter<string>();
  @Output() refresh = new EventEmitter<void>();

  searchTerm = '';
  selectedPaymentStatus = '';
  selectedCorridor = '';

  tabs: { key: OrderFilterTab; label: string; count: number }[] = [];

  ngOnChanges(): void {
    this.tabs = [
      { key: 'ALL', label: 'Toutes', count: this.totalCount },
      { key: 'EN_COURS', label: 'En cours', count: this.inProgressCount },
      { key: 'A_PREPARER', label: 'À préparer', count: this.preparingCount },
      { key: 'PRETES', label: 'Prêtes', count: this.readyCount },
      { key: 'EN_LIVRAISON', label: 'En livraison', count: this.inDeliveryCount },
      { key: 'LIVREES', label: 'Livrées', count: this.deliveredCount },
      { key: 'ANNULEES', label: 'Annulées', count: this.cancelledCount }
    ];
  }

  selectTab(tabKey: OrderFilterTab): void {
    this.selectedTab = tabKey;
    this.tabChange.emit(tabKey);
  }

  onSearch(): void {
    this.searchChange.emit(this.searchTerm);
  }

  onPaymentFilterChange(): void {
    this.paymentStatusChange.emit(this.selectedPaymentStatus);
  }

  onCorridorFilterChange(): void {
    this.corridorChange.emit(this.selectedCorridor);
  }
}
