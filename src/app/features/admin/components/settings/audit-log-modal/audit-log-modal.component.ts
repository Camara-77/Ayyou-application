import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditLogEntry } from '../../../models/admin-settings.models';

@Component({
  selector: 'app-audit-log-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-log-modal.component.html',
  styleUrls: ['./audit-log-modal.component.scss']
})
export class AuditLogModalComponent {
  @Input() isOpen: boolean = false;
  @Input() auditLogs: AuditLogEntry[] = [];
  @Output() closeModal = new EventEmitter<void>();

  onClose(): void {
    this.closeModal.emit();
  }
}
