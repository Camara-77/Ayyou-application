import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderFilterTab, OrderStatsSummary } from '../../models/admin-order.models';

@Component({
  selector: 'app-orders-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders-stats.component.html',
  styleUrls: ['./orders-stats.component.scss']
})
export class OrdersStatsComponent {
  @Input() stats!: OrderStatsSummary;
  @Input() selectedTab: OrderFilterTab = 'ALL';
  @Output() selectTab = new EventEmitter<OrderFilterTab>();

  onCardClick(tab: OrderFilterTab): void {
    this.selectTab.emit(tab);
  }
}
