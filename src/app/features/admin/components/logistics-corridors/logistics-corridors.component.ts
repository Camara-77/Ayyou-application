import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogisticsCorridor } from '../../models/admin-order.models';

@Component({
  selector: 'app-logistics-corridors',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logistics-corridors.component.html',
  styleUrls: ['./logistics-corridors.component.scss']
})
export class LogisticsCorridorsComponent {
  @Input() corridors: LogisticsCorridor[] = [];

  getProgressBarClass(barColor: 'green' | 'blue' | 'orange'): string {
    switch (barColor) {
      case 'green': return 'bar-green';
      case 'blue': return 'bar-blue';
      case 'orange': return 'bar-yellow';
      default: return 'bar-gray';
    }
  }
}
