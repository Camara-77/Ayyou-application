import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../../../core/services/notification.service';
import { ProAuthService } from '../../../../core/services/pro-auth.service';

@Component({
  selector: 'app-pro-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pro-header.component.html',
  styleUrls: ['./pro-header.component.scss']
})
export class ProHeaderComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private proAuthService = inject(ProAuthService);

  @Input() restaurantName: string = '';
  @Input() avatarUrl: string = '';
  @Input() isOpen: boolean = true;
  @Input() showBackButton: boolean = false;
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() backUrl: string = '/pro/dashboard';
  @Input() rightIcon: 'bell' | 'calendar' = 'bell';

  unreadCount: number = 0;
  dynamicAvatarUrl?: string;
  dynamicName?: string;
  dynamicIsOpen?: boolean;

  ngOnInit(): void {
    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });

    this.proAuthService.profile$.subscribe(profile => {
      if (profile) {
        this.dynamicAvatarUrl = profile.logoUrl || profile.avatarUrl;
        this.dynamicName = profile.name;
        this.dynamicIsOpen = profile.isOpen;
      }
    });
  }

  get computedAvatarUrl(): string {
    return this.dynamicAvatarUrl || this.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
  }

  get computedName(): string {
    return this.dynamicName || this.restaurantName || 'Mon Établissement';
  }

  get computedIsOpen(): boolean {
    return this.dynamicIsOpen !== undefined ? this.dynamicIsOpen : this.isOpen;
  }
}
