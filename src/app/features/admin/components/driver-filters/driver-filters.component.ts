import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DriverFilterTab } from '../../models/admin-driver.models';

@Component({
  selector: 'app-driver-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './driver-filters.component.html',
  styleUrls: ['./driver-filters.component.scss']
})
export class DriverFiltersComponent {
  activeTab: DriverFilterTab = 'ALL';
  selectedZone: string = 'ALL';
  selectedVehicle: string = 'ALL';

  zones: string[] = [
    'Plateau / Médina',
    'Almadies / Ngor',
    'Ouakam / Mermoz',
    'Maristes / Hann',
    'Fann Résidence',
    'Parcelles Assainies'
  ];

  vehicleTypes: string[] = [
    'Yamaha',
    'Boxer',
    'Kymco',
    'TVS'
  ];

  @Output() tabChange = new EventEmitter<DriverFilterTab>();
  @Output() zoneChange = new EventEmitter<string>();
  @Output() vehicleChange = new EventEmitter<string>();

  selectTab(tab: DriverFilterTab): void {
    this.activeTab = tab;
    this.tabChange.emit(this.activeTab);
  }

  onZoneSelect(): void {
    this.zoneChange.emit(this.selectedZone);
  }

  onVehicleSelect(): void {
    this.vehicleChange.emit(this.selectedVehicle);
  }
}
