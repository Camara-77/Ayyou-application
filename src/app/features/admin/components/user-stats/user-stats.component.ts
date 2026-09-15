import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserStatsSummary } from '../../models/admin-user.models';

@Component({
  selector: 'app-user-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-stats.component.html',
  styleUrls: ['./user-stats.component.scss']
})
export class UserStatsComponent {
  @Input() stats: UserStatsSummary | null = {
    total: 24580,
    clients: 24140,
    professionals: 440,
    active: 24395,
    disabled: 185
  };
}
