import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogCategory, CatalogFilterTab } from '../../models/admin-catalog.models';

@Component({
  selector: 'app-catalog-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalog-filters.component.html',
  styleUrls: ['./catalog-filters.component.scss']
})
export class CatalogFiltersComponent {
  @Input() selectedTab: CatalogFilterTab = 'ALL';
  @Input() totalCount: number = 4820;
  @Input() activeCount: number = 4615;
  @Input() pendingValidationCount: number = 18;
  @Input() outOfStockCount: number = 205;
  @Input() flaggedCount: number = 12;

  @Input() categories: CatalogCategory[] = [];

  @Output() tabChange = new EventEmitter<CatalogFilterTab>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() categoryChange = new EventEmitter<string>();
  @Output() establishmentChange = new EventEmitter<string>();

  searchQuery: string = '';
  selectedCategory: string = 'ALL';
  selectedEstablishment: string = 'ALL';

  onTabSelect(tab: CatalogFilterTab): void {
    this.selectedTab = tab;
    this.tabChange.emit(tab);
  }

  onSearchInput(): void {
    this.searchChange.emit(this.searchQuery);
  }

  onCategorySelect(): void {
    this.categoryChange.emit(this.selectedCategory);
  }

  onEstablishmentSelect(): void {
    this.establishmentChange.emit(this.selectedEstablishment);
  }
}
