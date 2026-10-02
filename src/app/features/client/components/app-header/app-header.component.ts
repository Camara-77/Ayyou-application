import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../../../core/services/notification.service';
import { AppLogoComponent } from '../../../../shared/components/app-logo/app-logo.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, AppLogoComponent],
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss']
})
export class AppHeaderComponent implements OnInit {
  private notificationService = inject(NotificationService);

  @Input() title?: string;
  @Input() showBack: boolean = false;
  @Input() showLogo: boolean = false;
  @Input() backUrl: string = '/home';
  @Input() notificationCount?: number;

  unreadCount: number = 0;

  ngOnInit(): void {
    if (this.notificationCount !== undefined) {
      this.unreadCount = this.notificationCount;
    } else {
      this.notificationService.unreadCount$.subscribe(count => {
        this.unreadCount = count;
      });
    }
  }
}
