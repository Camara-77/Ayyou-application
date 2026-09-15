import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AdminOrderService } from '../../services/admin-order.service';
import {
  Order,
  OrderFilterTab,
  OrderStatus,
  OrderStatsSummary,
  LogisticsCorridor
} from '../../models/admin-order.models';
import { OrdersStatsComponent } from '../../components/orders-stats/orders-stats.component';
import { OrdersFiltersComponent } from '../../components/orders-filters/orders-filters.component';
import { OrdersTableComponent } from '../../components/orders-table/orders-table.component';
import { OrderDetailsPanelComponent } from '../../components/order-details-panel/order-details-panel.component';
import { LogisticsCorridorsComponent } from '../../components/logistics-corridors/logistics-corridors.component';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [
    CommonModule,
    OrdersStatsComponent,
    OrdersFiltersComponent,
    OrdersTableComponent,
    OrderDetailsPanelComponent,
    LogisticsCorridorsComponent
  ],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.scss']
})
export class AdminOrdersComponent implements OnInit {
  orders$: Observable<Order[]>;
  selectedOrder$: Observable<Order | null>;
  statsSummary$: Observable<OrderStatsSummary>;
  logisticsCorridors$: Observable<LogisticsCorridor[]>;

  private activeTabSubject = new BehaviorSubject<OrderFilterTab>('ALL');
  private searchQuerySubject = new BehaviorSubject<string>('');
  private paymentStatusSubject = new BehaviorSubject<string>('');
  private corridorSubject = new BehaviorSubject<string>('');

  activeTab$ = this.activeTabSubject.asObservable();

  currentPage = 1;
  pageSize = 5;

  constructor(private adminOrderService: AdminOrderService) {
    this.selectedOrder$ = this.adminOrderService.selectedOrder$;
    this.statsSummary$ = this.adminOrderService.getStatsSummary();
    this.logisticsCorridors$ = this.adminOrderService.getCorridors();

    this.orders$ = combineLatest([
      this.activeTabSubject,
      this.searchQuerySubject,
      this.paymentStatusSubject,
      this.corridorSubject
    ]).pipe(
      switchMap(([tab, search, payment, corridor]) =>
        this.adminOrderService.filterOrders(tab, search, payment, corridor)
      )
    );
  }

  ngOnInit(): void {}

  onTabChange(tab: OrderFilterTab): void {
    this.activeTabSubject.next(tab);
    this.currentPage = 1;
  }

  onSearchChange(searchTerm: string): void {
    this.searchQuerySubject.next(searchTerm);
    this.currentPage = 1;
  }

  onPaymentStatusChange(paymentStatus: string): void {
    this.paymentStatusSubject.next(paymentStatus);
    this.currentPage = 1;
  }

  onCorridorChange(corridor: string): void {
    this.corridorSubject.next(corridor);
    this.currentPage = 1;
  }

  onSelectOrder(order: Order): void {
    this.adminOrderService.selectOrder(order);
  }

  onClosePanel(): void {
    this.adminOrderService.selectOrder(null);
  }

  onAssignDriver(order: Order): void {
    const driverName = prompt(`Assigner un livreur pour la commande ${order.reference}:`, order.delivery.driverName || 'Mamadou Ndiaye');
    if (driverName) {
      this.adminOrderService.assignDriver(order.id, driverName);
    }
  }

  onUpdateStatus(event: { order: Order; status: OrderStatus }): void {
    this.adminOrderService.updateOrderStatus(event.order.id, event.status);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onExportCsv(): void {
    this.adminOrderService.exportCsv();
  }

  onReconciliation(): void {
    this.adminOrderService.reconciliation();
  }
}
