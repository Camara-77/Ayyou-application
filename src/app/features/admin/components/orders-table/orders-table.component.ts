import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order, OrderStatus, PaymentStatus } from '../../models/admin-order.models';

@Component({
  selector: 'app-orders-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders-table.component.html',
  styleUrls: ['./orders-table.component.scss']
})
export class OrdersTableComponent {
  @Input() orders: Order[] = [];
  @Input() selectedOrder: Order | null = null;
  @Input() totalOrders = 0;
  @Input() currentPage = 1;
  @Input() pageSize = 10;

  @Output() selectOrder = new EventEmitter<Order>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() assignDriver = new EventEmitter<Order>();
  @Output() updateStatus = new EventEmitter<{ order: Order; status: OrderStatus }>();

  get totalPages(): number {
    return Math.ceil(this.totalOrders / this.pageSize) || 1;
  }

  onRowClick(order: Order): void {
    this.selectOrder.emit(order);
  }

  getStatusBadgeClass(statusColor: 'orange' | 'blue' | 'green' | 'red' | 'gray'): string {
    switch (statusColor) {
      case 'orange': return 'badge-warning';
      case 'blue': return 'badge-info';
      case 'green': return 'badge-success';
      case 'red': return 'badge-danger';
      case 'gray': return 'badge-secondary';
      default: return 'badge-secondary';
    }
  }

  getPaymentBadgeClass(status: PaymentStatus): string {
    switch (status) {
      case 'PAYE': return 'pay-paid';
      case 'EN_ATTENTE': return 'pay-pending';
      case 'ECHOUE': return 'pay-failed';
      case 'REMBOURSE': return 'pay-refunded';
      default: return '';
    }
  }

  onPrevPage(): void {
    if (this.currentPage > 1) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  onNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }
}
