import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-pro-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pro-header.component.html',
  styleUrls: ['./pro-header.component.scss']
})
export class ProHeaderComponent {
  @Input() restaurantName: string = 'Chez Loutcha';
  @Input() avatarUrl: string = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80';
  @Input() isOpen: boolean = true;
  @Input() showBackButton: boolean = false;
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() backUrl: string = '/pro/dashboard';
  @Input() rightIcon: 'bell' | 'calendar' = 'bell';
}
