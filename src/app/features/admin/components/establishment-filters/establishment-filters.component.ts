import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstablishmentFilterTab } from '../../models/admin-business.models';

@Component({
  selector: 'app-establishment-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './establishment-filters.component.html',
  styleUrls: ['./establishment-filters.component.scss']
})
export class EstablishmentFiltersComponent {
  activeTab: EstablishmentFilterTab = 'ALL';
  selectedNeighborhood: string = 'ALL';

  neighborhoods: string[] = [
    'Corniche Ouest',
    'Plateau',
    'Almadies',
    'Mermoz',
    'Ouakam',
    'Ngor',
    'Point E'
  ];

  @Output() tabChange = new EventEmitter<EstablishmentFilterTab>();
  @Output() neighborhoodChange = new EventEmitter<string>();

  selectTab(tab: EstablishmentFilterTab): void {
    this.activeTab = tab;
    this.tabChange.emit(this.activeTab);
  }

  onNeighborhoodSelect(): void {
    this.neighborhoodChange.emit(this.selectedNeighborhood);
  }
}
