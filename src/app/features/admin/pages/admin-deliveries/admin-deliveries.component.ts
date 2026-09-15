import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AdminDeliveryService } from '../../services/admin-delivery.service';
import {
  DeliveryCorridor,
  DeliveryFilterTab,
  DeliveryItem,
  DeliveryStatsSummary,
  DeliveryTimelineEvent
} from '../../models/admin-delivery.models';
import { DeliveryStatsComponent } from '../../components/delivery-stats/delivery-stats.component';
import { DeliveryFiltersComponent } from '../../components/delivery-filters/delivery-filters.component';
import { DeliveryTableComponent } from '../../components/delivery-table/delivery-table.component';
import { DeliveryCorridorsComponent } from '../../components/delivery-corridors/delivery-corridors.component';
import { DeliveryDetailsPanelComponent } from '../../components/delivery-details-panel/delivery-details-panel.component';

@Component({
  selector: 'app-admin-deliveries',
  standalone: true,
  imports: [
    CommonModule,
    DeliveryStatsComponent,
    DeliveryFiltersComponent,
    DeliveryTableComponent,
    DeliveryCorridorsComponent,
    DeliveryDetailsPanelComponent
  ],
  templateUrl: './admin-deliveries.component.html',
  styleUrls: ['./admin-deliveries.component.scss']
})
export class AdminDeliveriesComponent implements OnInit {
  deliveries$: Observable<DeliveryItem[]>;
  selectedDelivery$: Observable<DeliveryItem | null>;
  statsSummary$: Observable<DeliveryStatsSummary>;
  logisticsCorridors$: Observable<DeliveryCorridor[]>;
  timelineEvents$: Observable<DeliveryTimelineEvent[]>;

  private activeTabSubject = new BehaviorSubject<DeliveryFilterTab>('ALL');
  private searchQuerySubject = new BehaviorSubject<string>('');
  private corridorSubject = new BehaviorSubject<string>('');
  private vehicleSubject = new BehaviorSubject<string>('');

  activeTab$ = this.activeTabSubject.asObservable();

  constructor(private adminDeliveryService: AdminDeliveryService) {
    this.selectedDelivery$ = this.adminDeliveryService.selectedDelivery$;
    this.statsSummary$ = this.adminDeliveryService.getStatsSummary();
    this.logisticsCorridors$ = this.adminDeliveryService.getCorridors();

    this.deliveries$ = combineLatest([
      this.activeTabSubject,
      this.searchQuerySubject,
      this.corridorSubject,
      this.vehicleSubject
    ]).pipe(
      switchMap(([tab, search, corridor, vehicle]) =>
        this.adminDeliveryService.filterDeliveries(tab, search, corridor, vehicle)
      )
    );

    this.timelineEvents$ = this.selectedDelivery$.pipe(
      switchMap(delivery => {
        if (!delivery) return [];
        return this.adminDeliveryService.getTimelineForDelivery(delivery.reference);
      })
    );
  }

  ngOnInit(): void {}

  onTabChange(tab: DeliveryFilterTab): void {
    this.activeTabSubject.next(tab);
  }

  onSearchChange(searchTerm: string): void {
    this.searchQuerySubject.next(searchTerm);
  }

  onCorridorChange(corridor: string): void {
    this.corridorSubject.next(corridor);
  }

  onVehicleChange(vehicle: string): void {
    this.vehicleSubject.next(vehicle);
  }

  onSelectDelivery(delivery: DeliveryItem): void {
    this.adminDeliveryService.selectDelivery(delivery);
  }

  onClosePanel(): void {
    this.adminDeliveryService.selectDelivery(null);
  }

  onReassign(delivery: DeliveryItem): void {
    const newCourier = prompt(`Réassigner la course ${delivery.reference} à un coursier relais disponible:`, 'Modou Fall');
    if (newCourier) {
      this.adminDeliveryService.reassignCourier(delivery.id, newCourier);
    }
  }

  onCloseIncident(delivery: DeliveryItem): void {
    this.adminDeliveryService.closeIncident(delivery.id);
  }

  onCallCourier(delivery: DeliveryItem): void {
    alert(`Appel du coursier ${delivery.courierName} (${delivery.courierPhone})...`);
  }

  onContactClient(delivery: DeliveryItem): void {
    alert(`Envoi d'un message au client ${delivery.destinationName}...`);
  }
}
