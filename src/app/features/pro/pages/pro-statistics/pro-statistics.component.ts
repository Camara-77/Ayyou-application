import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProHeaderComponent } from '../../components/pro-header/pro-header.component';
import { ProBottomNavComponent } from '../../components/pro-bottom-nav/pro-bottom-nav.component';
import { ProStatsService } from '../../../../core/services/pro-stats.service';
import { ProStats } from '../../../../core/models/pro';

@Component({
  selector: 'app-pro-statistics',
  standalone: true,
  imports: [CommonModule, RouterModule, ProHeaderComponent, ProBottomNavComponent],
  templateUrl: './pro-statistics.component.html',
  styleUrls: ['./pro-statistics.component.scss']
})
export class ProStatisticsComponent implements OnInit {
  stats!: ProStats;
  selectedPeriod: 'TODAY' | 'WEEK' | 'MONTH' = 'TODAY';

  constructor(private proStatsService: ProStatsService) {}

  ngOnInit(): void {
    this.stats = this.proStatsService.getStats();
  }

  setPeriod(period: 'TODAY' | 'WEEK' | 'MONTH'): void {
    this.selectedPeriod = period;
  }
}
