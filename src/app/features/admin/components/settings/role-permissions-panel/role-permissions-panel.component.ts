import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RolePermissionsConfig } from '../../../models/admin-settings.models';

@Component({
  selector: 'app-role-permissions-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-permissions-panel.component.html',
  styleUrls: ['./role-permissions-panel.component.scss']
})
export class RolePermissionsPanelComponent {
  @Input() roleConfig: RolePermissionsConfig | null = null;
  @Output() togglePermission = new EventEmitter<string>();

  onTogglePermission(permId: string): void {
    this.togglePermission.emit(permId);
  }
}
