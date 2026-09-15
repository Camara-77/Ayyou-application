import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentItem } from '../../models/admin-payment.models';

@Component({
  selector: 'app-payment-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-table.component.html',
  styleUrls: ['./payment-table.component.scss']
})
export class PaymentTableComponent {
  @Input() payments: PaymentItem[] = [];
  @Input() selectedPayment: PaymentItem | null = null;
  @Output() selectPayment = new EventEmitter<PaymentItem>();

  onSelectRow(payment: PaymentItem): void {
    this.selectPayment.emit(payment);
  }
}
