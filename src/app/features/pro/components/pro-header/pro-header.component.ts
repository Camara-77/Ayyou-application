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
  showToast: boolean = false;
  toastMessage: string = '';
  private toastTimeout?: any;

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

  copyStoreLink(): void {
    this.closeMenu();
    const profile = this.proAuthService.currentProfile;
    const etabId = profile?.id || '69';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const publicUrl = `${origin}/restaurant/${etabId}`;

    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(publicUrl).then(() => {
        this.triggerToast('✓ Lien de la boutique copié');
      }).catch(() => {
        this.fallbackCopy(publicUrl);
      });
    } else {
      this.fallbackCopy(publicUrl);
    }
  }

  private fallbackCopy(text: string): void {
    if (typeof document === 'undefined') return;
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      this.triggerToast('✓ Lien de la boutique copié');
    } catch (e) {
      this.triggerToast('Erreur lors de la copie');
    }
    document.body.removeChild(textArea);
  }

  private triggerToast(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastTimeout = setTimeout(() => {
      this.showToast = false;
    }, 2500);
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
