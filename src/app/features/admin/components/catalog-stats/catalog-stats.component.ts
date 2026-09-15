import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogStatsSummary } from '../../models/admin-catalog.models';

@Component({
  selector: 'app-catalog-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalog-stats.component.html',
  styleUrls: ['./catalog-stats.component.scss']
})
export class CatalogStatsComponent {
  @Input() stats!: CatalogStatsSummary;
}
