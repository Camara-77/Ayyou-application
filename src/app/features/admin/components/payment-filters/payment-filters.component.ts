import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentFilterTab } from '../../models/admin-payment.models';

@Component({
  selector: 'app-payment-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-filters.component.html',
  styleUrls: ['./payment-filters.component.scss']
})
export class PaymentFiltersComponent {
  @Input() selectedTab: PaymentFilterTab = 'ALL';
  @Input() totalCount: number = 0;
  @Input() subscriptionsCount: number = 0;
  @Input() restaurantsCount: number = 0;
  @Input() couriersCount: number = 0;
  @Input() disputesCount: number = 0;

  @Output() tabChange = new EventEmitter<PaymentFilterTab>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() methodChange = new EventEmitter<string>();
  @Output() periodChange = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<string>();

  searchQuery: string = '';
  selectedMethod: string = 'ALL';
  selectedPeriod: string = 'CURRENT_MONTH';
  selectedStatus: string = 'ALL';

  onTabSelect(tab: PaymentFilterTab): void {
    this.selectedTab = tab;
    this.tabChange.emit(tab);
  }

  onSearchInput(): void {
    this.searchChange.emit(this.searchQuery);
  }

  onMethodSelect(): void {
    this.methodChange.emit(this.selectedMethod);
  }

  onPeriodSelect(): void {
    this.periodChange.emit(this.selectedPeriod);
  }

  onStatusSelect(): void {
    this.statusChange.emit(this.selectedStatus);
  }
}
