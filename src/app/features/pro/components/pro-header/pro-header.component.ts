import { Component, Input, Output, EventEmitter, OnInit, HostListener, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NotificationService } from '../../../../core/services/notification.service';
import { ProAuthService } from '../../../../core/services/pro-auth.service';
import { AuthService } from '../../../../core/services/auth.service';

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
  private authService = inject(AuthService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  @Input() restaurantName: string = '';
  @Input() avatarUrl: string = '';
  @Input() isOpen: boolean = true;
  @Input() showBackButton: boolean = false;
  @Input() showLogout: boolean = false;
  @Input() showMenu: boolean = false;
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() backUrl: string = '/pro/dashboard';
  @Input() rightIcon: 'bell' | 'calendar' = 'bell';

  @Output() logout = new EventEmitter<void>();

  unreadCount: number = 0;
  dynamicAvatarUrl?: string;
  dynamicName?: string;
  dynamicIsOpen?: boolean;
  isMenuOpen: boolean = false;

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

  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isMenuOpen && !this.elementRef.nativeElement.contains(event.target)) {
      this.isMenuOpen = false;
    }
  }

  onLogout(): void {
    this.proAuthService.logout();
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/pro/login']);
    });
    this.logout.emit();
  }

  onLogoutAction(): void {
    this.closeMenu();
    this.onLogout();
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
