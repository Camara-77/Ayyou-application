import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserFilterTab } from '../../models/admin-user.models';

@Component({
  selector: 'app-user-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-filters.component.html',
  styleUrls: ['./user-filters.component.scss']
})
export class UserFiltersComponent {
  activeTab: UserFilterTab = 'ALL';
  searchQuery: string = '';

  @Output() tabChange = new EventEmitter<UserFilterTab>();
  @Output() searchChange = new EventEmitter<string>();

  selectTab(tab: UserFilterTab): void {
    this.activeTab = tab;
    this.tabChange.emit(this.activeTab);
  }

  onSearchInput(): void {
    this.searchChange.emit(this.searchQuery);
  }
}
