import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeliveryFilterTab, DeliveryStatsSummary } from '../../models/admin-delivery.models';

@Component({
  selector: 'app-delivery-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delivery-stats.component.html',
  styleUrls: ['./delivery-stats.component.scss']
})
export class DeliveryStatsComponent {
  @Input() stats!: DeliveryStatsSummary;
  @Input() selectedTab: DeliveryFilterTab = 'ALL';
  @Output() selectTab = new EventEmitter<DeliveryFilterTab>();

  onCardClick(tab: DeliveryFilterTab): void {
    this.selectTab.emit(tab);
  }
}
