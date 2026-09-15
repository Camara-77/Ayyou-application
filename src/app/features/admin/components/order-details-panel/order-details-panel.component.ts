import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Order, OrderStatus } from '../../models/admin-order.models';

@Component({
  selector: 'app-order-details-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-details-panel.component.html',
  styleUrls: ['./order-details-panel.component.scss']
})
export class OrderDetailsPanelComponent {
  @Input() order: Order | null = null;
  @Output() closePanel = new EventEmitter<void>();
  @Output() assignDriver = new EventEmitter<Order>();
  @Output() updateStatus = new EventEmitter<{ order: Order; status: OrderStatus }>();

  showStatusDropdown = false;

  availableStatuses: { status: OrderStatus; label: string }[] = [
    { status: 'A_PREPARER', label: 'À préparer' },
    { status: 'EN_PREPARATION', label: 'En préparation' },
    { status: 'PRETE', label: 'Prête' },
    { status: 'EN_LIVRAISON', label: 'En livraison' },
    { status: 'LIVREE', label: 'Livrée' },
    { status: 'ANNULEE', label: 'Annulée' },
    { status: 'LITIGE', label: 'En litige' }
  ];

  onClose(): void {
    this.closePanel.emit();
  }

  onAssignDriverClick(): void {
    if (this.order) {
      this.assignDriver.emit(this.order);
    }
  }

  onSelectStatus(status: OrderStatus): void {
    if (this.order) {
      this.updateStatus.emit({ order: this.order, status });
      this.showStatusDropdown = false;
    }
  }
}
