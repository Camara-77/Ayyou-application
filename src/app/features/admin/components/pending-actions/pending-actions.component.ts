import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PendingAction } from '../../models/admin.models';

@Component({
  selector: 'app-pending-actions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pending-actions.component.html',
  styleUrls: ['./pending-actions.component.scss']
})
export class PendingActionsComponent {
  @Input({ required: true }) actions: PendingAction[] = [];
  @Output() actionClick = new EventEmitter<PendingAction>();

  onAction(action: PendingAction): void {
    this.actionClick.emit(action);
  }
}
