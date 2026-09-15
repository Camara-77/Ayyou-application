import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentFilterTab, PaymentStatsSummary } from '../../models/admin-payment.models';

@Component({
  selector: 'app-payment-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-stats.component.html',
  styleUrls: ['./payment-stats.component.scss']
})
export class PaymentStatsComponent {
  @Input() stats!: PaymentStatsSummary;
  @Input() selectedTab: PaymentFilterTab = 'ALL';
  @Output() selectTab = new EventEmitter<PaymentFilterTab>();
}
