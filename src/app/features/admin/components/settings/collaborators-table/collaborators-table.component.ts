import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminCollaborator } from '../../../models/admin-settings.models';

@Component({
  selector: 'app-collaborators-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './collaborators-table.component.html',
  styleUrls: ['./collaborators-table.component.scss']
})
export class CollaboratorsTableComponent {
  @Input() collaborators: AdminCollaborator[] = [];
  @Output() openInviteModal = new EventEmitter<void>();
  @Output() searchQueryChange = new EventEmitter<string>();

  searchQuery: string = '';

  onSearchInput(): void {
    this.searchQueryChange.emit(this.searchQuery);
  }
}
