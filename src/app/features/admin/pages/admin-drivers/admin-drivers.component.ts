import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { DriverDetail, DriverFilterTab, DriverStatsSummary } from '../../models/admin-driver.models';
import { AdminDriverService } from '../../services/admin-driver.service';
import { DriverStatsComponent } from '../../components/driver-stats/driver-stats.component';
import { DriverFiltersComponent } from '../../components/driver-filters/driver-filters.component';
import { DriverTableComponent } from '../../components/driver-table/driver-table.component';
import { DriverDetailsPanelComponent } from '../../components/driver-details-panel/driver-details-panel.component';

@Component({
  selector: 'app-admin-drivers',
  standalone: true,
  imports: [
    CommonModule,
    DriverStatsComponent,
    DriverFiltersComponent,
    DriverTableComponent,
    DriverDetailsPanelComponent
  ],
  templateUrl: './admin-drivers.component.html',
  styleUrls: ['./admin-drivers.component.scss']
})
export class AdminDriversComponent implements OnInit {
  drivers$!: Observable<DriverDetail[]>;
  selectedDriver$!: Observable<DriverDetail | null>;
  stats$!: Observable<DriverStatsSummary>;

  currentTab: DriverFilterTab = 'ALL';
  currentZone: string = 'ALL';
  currentVehicle: string = 'ALL';

  constructor(private driverService: AdminDriverService) {}

  ngOnInit(): void {
    this.stats$ = this.driverService.getStatsSummary();
    this.selectedDriver$ = this.driverService.selectedDriver$;
    this.loadFiltered();
  }

  onTabChange(tab: DriverFilterTab): void {
    this.currentTab = tab;
    this.loadFiltered();
  }

  onZoneChange(zone: string): void {
    this.currentZone = zone;
    this.loadFiltered();
  }

  onVehicleChange(vehicle: string): void {
    this.currentVehicle = vehicle;
    this.loadFiltered();
  }

  onSelectDriver(driver: DriverDetail): void {
    this.driverService.selectDriver(driver);
  }

  onApproveCandidate(id: string): void {
    this.driverService.approveCandidate(id);
    this.loadFiltered();
  }

  onRejectCandidate(id: string): void {
    this.driverService.rejectCandidate(id);
    this.loadFiltered();
  }

  private loadFiltered(): void {
    this.drivers$ = this.driverService.filterDrivers(this.currentTab, this.currentZone, this.currentVehicle);
  }
}
