import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DriverStatsSummary } from '../../models/admin-driver.models';

@Component({
  selector: 'app-driver-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './driver-stats.component.html',
  styleUrls: ['./driver-stats.component.scss']
})
export class DriverStatsComponent {
  @Input() stats: DriverStatsSummary | null = null;
}
