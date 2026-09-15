import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminUserDetail } from '../../models/admin-user.models';

@Component({
  selector: 'app-user-details-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-details-panel.component.html',
  styleUrls: ['./user-details-panel.component.scss']
})
export class UserDetailsPanelComponent {
  @Input() user: AdminUserDetail | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() toggleStatus = new EventEmitter<string>();

  showConfirmModal: boolean = false;

  get initials(): string {
    if (!this.user) return 'US';
    const first = this.user.firstName ? this.user.firstName.charAt(0) : '';
    const last = this.user.lastName ? this.user.lastName.charAt(0) : '';
    return `${first}${last}`.toUpperCase() || 'US';
  }

  onClosePanel(): void {
    this.close.emit();
  }

  promptToggleStatus(): void {
    this.showConfirmModal = true;
  }

  confirmToggleStatus(): void {
    if (this.user) {
      this.toggleStatus.emit(this.user.id);
    }
    this.showConfirmModal = false;
  }

  cancelModal(): void {
    this.showConfirmModal = false;
  }
}
