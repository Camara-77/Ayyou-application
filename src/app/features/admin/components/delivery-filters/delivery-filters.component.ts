import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeliveryFilterTab } from '../../models/admin-delivery.models';

@Component({
  selector: 'app-delivery-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delivery-filters.component.html',
  styleUrls: ['./delivery-filters.component.scss']
})
export class DeliveryFiltersComponent {
  @Input() selectedTab: DeliveryFilterTab = 'ALL';
  @Input() totalCount = 74;
  @Input() inDeliveryCount = 48;
  @Input() pendingCount = 18;
  @Input() potentialDelayCount = 5;
  @Input() incidentsCount = 3;

  @Output() tabChange = new EventEmitter<DeliveryFilterTab>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() corridorChange = new EventEmitter<string>();
  @Output() vehicleChange = new EventEmitter<string>();

  searchTerm = '';
  selectedCorridor = '';
  selectedVehicle = '';

  tabs: { key: DeliveryFilterTab; label: string; count: number; dotColor?: string }[] = [];

  ngOnChanges(): void {
    this.tabs = [
      { key: 'ALL', label: 'Toutes les courses', count: this.totalCount },
      { key: 'EN_ACHEMINEMENT', label: 'En acheminement', count: this.inDeliveryCount },
      { key: 'EN_ATTENTE', label: 'En attente de prise en charge', count: this.pendingCount },
      { key: 'RETARD_POTENTIEL', label: 'Retard potentiel', count: this.potentialDelayCount, dotColor: 'orange' },
      { key: 'INCIDENTS', label: 'Litiges / Incidents', count: this.incidentsCount, dotColor: 'red' }
    ];
  }

  selectTab(tabKey: DeliveryFilterTab): void {
    this.selectedTab = tabKey;
    this.tabChange.emit(tabKey);
  }

  onSearch(): void {
    this.searchChange.emit(this.searchTerm);
  }

  onCorridorFilterChange(): void {
    this.corridorChange.emit(this.selectedCorridor);
  }

  onVehicleFilterChange(): void {
    this.vehicleChange.emit(this.selectedVehicle);
  }
}
