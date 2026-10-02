import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AdminPaymentService } from '../../services/admin-payment.service';
import {
  PaymentFilterTab,
  PaymentItem,
  PaymentStatsSummary
} from '../../models/admin-payment.models';
import { PaymentStatsComponent } from '../../components/payment-stats/payment-stats.component';
import { PaymentFiltersComponent } from '../../components/payment-filters/payment-filters.component';
import { PaymentTableComponent } from '../../components/payment-table/payment-table.component';
import { PaymentDetailsPanelComponent } from '../../components/payment-details-panel/payment-details-panel.component';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [
    CommonModule,
    PaymentStatsComponent,
    PaymentFiltersComponent,
    PaymentTableComponent,
    PaymentDetailsPanelComponent
  ],
  templateUrl: './admin-payments.component.html',
  styleUrls: ['./admin-payments.component.scss']
})
export class AdminPaymentsComponent implements OnInit {
  payments$: Observable<PaymentItem[]>;
  selectedPayment$: Observable<PaymentItem | null>;
  statsSummary$: Observable<PaymentStatsSummary>;

  private activeTabSubject = new BehaviorSubject<PaymentFilterTab>('ALL');
  private searchQuerySubject = new BehaviorSubject<string>('');
  private methodSubject = new BehaviorSubject<string>('ALL');
  private periodSubject = new BehaviorSubject<string>('CURRENT_MONTH');
  private statusSubject = new BehaviorSubject<string>('ALL');

  activeTab$ = this.activeTabSubject.asObservable();

  constructor(private adminPaymentService: AdminPaymentService) {
    this.selectedPayment$ = this.adminPaymentService.selectedPayment$;
    this.statsSummary$ = this.adminPaymentService.getStatsSummary();

    this.payments$ = combineLatest([
      this.activeTabSubject,
      this.searchQuerySubject,
      this.methodSubject,
      this.periodSubject,
      this.statusSubject
    ]).pipe(
      switchMap(([tab, search, method, period, status]) =>
        this.adminPaymentService.filterPayments(tab, search, method, period, status)
      )
    );
  }

  ngOnInit(): void {}

  onTabChange(tab: PaymentFilterTab): void {
    this.activeTabSubject.next(tab);
  }

  onSearchChange(searchTerm: string): void {
    this.searchQuerySubject.next(searchTerm);
  }

  onMethodChange(method: string): void {
    this.methodSubject.next(method);
  }

  onPeriodChange(period: string): void {
    this.periodSubject.next(period);
  }

  onStatusChange(status: string): void {
    this.statusSubject.next(status);
  }

  onSelectPayment(payment: PaymentItem): void {
    this.adminPaymentService.selectPayment(payment);
  }

  onClosePanel(): void {
    this.adminPaymentService.selectPayment(null);
  }

  onVerifyPayment(payment: PaymentItem): void {
    this.adminPaymentService.verifyPayment(payment.id).subscribe();
  }

  onReminderPartner(payment: PaymentItem): void {
    this.adminPaymentService.reminderPartner(payment.id);
  }

  getSubscriptionsCount(payments: PaymentItem[]): number {
    return payments.filter(p => p.operationType === 'ABONNEMENT_FORFAIT').length;
  }

  getRestaurantsCount(payments: PaymentItem[]): number {
    return payments.filter(p => p.operationType === 'VERSEMENT_RESTAURANT' || p.operationType === 'VERSEMENT_VENDEUR' || p.beneficiaryType === 'RESTAURANT' || p.beneficiaryType === 'VENDEUR').length;
  }

  getCouriersCount(payments: PaymentItem[]): number {
    return payments.filter(p => p.operationType === 'REMUNERATION_LIVREUR' || p.beneficiaryType === 'COURSIER').length;
  }

  getDisputesCount(payments: PaymentItem[]): number {
    return payments.filter(p => p.operationType === 'LITIGE_REMBOURSEMENT' || p.status === 'ECHOUER' || p.status === 'A_VERIFIER').length;
  }
}
