import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminOrder } from '../../models/admin.models';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'app-active-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusBadgeComponent],
  templateUrl: './active-orders.component.html',
  styleUrls: ['./active-orders.component.scss']
})
export class ActiveOrdersComponent {
  @Input({ required: true }) orders: AdminOrder[] = [];
  @Input() totalActiveCount: number = 58;
}
