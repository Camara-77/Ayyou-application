import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeliveryItem } from '../../models/admin-delivery.models';

@Component({
  selector: 'app-delivery-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delivery-table.component.html',
  styleUrls: ['./delivery-table.component.scss']
})
export class DeliveryTableComponent {
  @Input() deliveries: DeliveryItem[] = [];
  @Input() selectedDelivery: DeliveryItem | null = null;

  @Output() selectDelivery = new EventEmitter<DeliveryItem>();

  onRowClick(delivery: DeliveryItem): void {
    this.selectDelivery.emit(delivery);
  }
}
