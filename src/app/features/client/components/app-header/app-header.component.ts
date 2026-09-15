import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss']
})
export class AppHeaderComponent {
  @Input() title?: string;
  @Input() showBack: boolean = false;
  @Input() showLogo: boolean = false;
  @Input() backUrl: string = '/home';
  @Input() notificationCount: number = 2;
}
