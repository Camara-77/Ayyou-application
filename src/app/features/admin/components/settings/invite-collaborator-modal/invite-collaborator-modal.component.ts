import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SystemRoleType } from '../../../models/admin-settings.models';

@Component({
  selector: 'app-invite-collaborator-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invite-collaborator-modal.component.html',
  styleUrls: ['./invite-collaborator-modal.component.scss']
})
export class InviteCollaboratorModalComponent {
  @Input() isOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() sendInvite = new EventEmitter<{
    name: string;
    email: string;
    role: SystemRoleType;
    scope: string;
  }>();

  name: string = '';
  email: string = '';
  role: SystemRoleType = 'Support Opérationnel Niveau 1';
  scope: string = '';

  onClose(): void {
    this.closeModal.emit();
  }

  onSubmit(): void {
    if (this.name && this.email && this.scope) {
      this.sendInvite.emit({
        name: this.name,
        email: this.email,
        role: this.role,
        scope: this.scope
      });
      this.resetForm();
      this.onClose();
    }
  }

  private resetForm(): void {
    this.name = '';
    this.email = '';
    this.role = 'Support Opérationnel Niveau 1';
    this.scope = '';
  }
}
