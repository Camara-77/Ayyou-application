import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminDelivery } from '../../models/admin.models';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'app-active-deliveries',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusBadgeComponent],
  templateUrl: './active-deliveries.component.html',
  styleUrls: ['./active-deliveries.component.scss']
})
export class ActiveDeliveriesComponent {
  @Input({ required: true }) deliveries: AdminDelivery[] = [];
  @Input() regionLabel: string = 'Dakar Métropole';
}
