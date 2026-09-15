import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.scss']
})
export class StatusBadgeComponent {
  @Input() label: string = '';
  @Input() color: 'green' | 'orange' | 'blue' | 'red' | 'gray' = 'gray';
  @Input() showDot: boolean = true;
}
