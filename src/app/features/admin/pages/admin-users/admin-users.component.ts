import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { AdminUserDetail, UserFilterTab, UserStatsSummary } from '../../models/admin-user.models';
import { AdminUserService } from '../../services/admin-user.service';
import { UserStatsComponent } from '../../components/user-stats/user-stats.component';
import { UserFiltersComponent } from '../../components/user-filters/user-filters.component';
import { UserTableComponent } from '../../components/user-table/user-table.component';
import { UserDetailsPanelComponent } from '../../components/user-details-panel/user-details-panel.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    UserStatsComponent,
    UserFiltersComponent,
    UserTableComponent,
    UserDetailsPanelComponent
  ],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
  users$!: Observable<AdminUserDetail[]>;
  selectedUser$!: Observable<AdminUserDetail | null>;
  stats$!: Observable<UserStatsSummary>;

  currentTab: UserFilterTab = 'ALL';
  currentSearch: string = '';

  constructor(private userService: AdminUserService) {}

  ngOnInit(): void {
    this.stats$ = this.userService.getStatsSummary();
    this.selectedUser$ = this.userService.selectedUser$;
    this.loadFilteredUsers();
  }

  onTabChange(tab: UserFilterTab): void {
    this.currentTab = tab;
    this.loadFilteredUsers();
  }

  onSearchChange(query: string): void {
    this.currentSearch = query;
    this.loadFilteredUsers();
  }

  onSelectUser(user: AdminUserDetail): void {
    this.userService.selectUser(user);
  }

  onCloseDetails(): void {
    // If user clicks close on details panel, we can leave selected or keep panel hidden
  }

  onToggleUserStatus(userId: string): void {
    this.userService.toggleUserStatus(userId);
    this.loadFilteredUsers();
  }

  private loadFilteredUsers(): void {
    this.users$ = this.userService.filterUsers(this.currentTab, this.currentSearch);
  }
}
