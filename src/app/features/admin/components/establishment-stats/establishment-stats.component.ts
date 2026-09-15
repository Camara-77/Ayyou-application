import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstablishmentStatsSummary } from '../../models/admin-business.models';

@Component({
  selector: 'app-establishment-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './establishment-stats.component.html',
  styleUrls: ['./establishment-stats.component.scss']
})
export class EstablishmentStatsComponent {
  @Input() stats: EstablishmentStatsSummary | null = null;
}
