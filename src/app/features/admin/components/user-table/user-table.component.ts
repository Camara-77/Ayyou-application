import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminUserDetail } from '../../models/admin-user.models';

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.scss']
})
export class UserTableComponent {
  @Input() users: AdminUserDetail[] = [];
  @Input() selectedUser: AdminUserDetail | null = null;
  @Output() selectUser = new EventEmitter<AdminUserDetail>();

  currentPage: number = 1;
  totalPages: number = 2;

  onRowClick(user: AdminUserDetail): void {
    this.selectUser.emit(user);
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
