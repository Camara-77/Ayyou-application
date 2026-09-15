import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { AdminService } from '../../services/admin.service';
import { StatCard, AdminOrder, AdminDelivery, PendingAction } from '../../models/admin.models';
import { StatCardComponent } from '../../components/stat-card/stat-card.component';
import { ActiveOrdersComponent } from '../../components/active-orders/active-orders.component';
import { ActiveDeliveriesComponent } from '../../components/active-deliveries/active-deliveries.component';
import { PendingActionsComponent } from '../../components/pending-actions/pending-actions.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    StatCardComponent,
    ActiveOrdersComponent,
    ActiveDeliveriesComponent,
    PendingActionsComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  statCards$!: Observable<StatCard[]>;
  activeOrders$!: Observable<AdminOrder[]>;
  activeDeliveries$!: Observable<AdminDelivery[]>;
  pendingActions$!: Observable<PendingAction[]>;

  todayDateText: string = "Aujourd'hui, 24 Octobre 2024";

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData(): void {
    this.statCards$ = this.adminService.getStatCards();
    this.activeOrders$ = this.adminService.getActiveOrders();
    this.activeDeliveries$ = this.adminService.getActiveDeliveries();
    this.pendingActions$ = this.adminService.getPendingActions();
  }
}
