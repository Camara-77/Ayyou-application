import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentItem } from '../../models/admin-payment.models';

@Component({
  selector: 'app-payment-details-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-details-panel.component.html',
  styleUrls: ['./payment-details-panel.component.scss']
})
export class PaymentDetailsPanelComponent {
  @Input() payment: PaymentItem | null = null;
  @Output() closePanel = new EventEmitter<void>();
  @Output() verifyPayment = new EventEmitter<PaymentItem>();
  @Output() reminderPartner = new EventEmitter<PaymentItem>();

  onClose(): void {
    this.closePanel.emit();
  }

  onVerify(): void {
    if (this.payment) {
      this.verifyPayment.emit(this.payment);
    }
  }

  onReminder(): void {
    if (this.payment) {
      this.reminderPartner.emit(this.payment);
    }
  }

  onExportPdf(): void {
    if (this.payment) {
      alert(`Génération du reçu de paiement ${this.payment.reference} au format PDF...`);
    }
  }
}
