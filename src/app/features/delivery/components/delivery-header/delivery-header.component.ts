import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DeliveryService } from '../../../../core/services/delivery.service';
import { DriverAuthService } from '../../services/driver-auth.service';
import { AuthService } from '../../../../core/services/auth.service';
import { LivreurProfile } from '../../../../core/models/delivery';

@Component({
  selector: 'app-delivery-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './delivery-header.component.html',
  styleUrl: './delivery-header.component.scss'
})
export class DeliveryHeaderComponent implements OnInit {
  private deliveryService = inject(DeliveryService);
  private driverAuthService = inject(DriverAuthService);
  private authService = inject(AuthService);

  @Input() title?: string;
  @Input() showBackButton: boolean = false;
  @Input() backUrl?: string;

  @Output() backClick = new EventEmitter<void>();

  realDriverProfile: LivreurProfile | null = null;
  isOnDuty: boolean = true;

  ngOnInit(): void {
    this.deliveryService.driverProfile$.subscribe(profile => {
      if (profile) {
        this.realDriverProfile = profile;
        this.isOnDuty = profile.est_disponible;
      }
    });

    this.deliveryService.getDriverProfile().subscribe({
      next: (profile) => {
        this.realDriverProfile = profile;
        this.isOnDuty = profile.est_disponible;
      },
      error: () => {}
    });
  }

  get driverName(): string {
    if (this.realDriverProfile) {
      const full = `${this.realDriverProfile.prenom || ''} ${this.realDriverProfile.nom || ''}`.trim();
      if (full) return full;
    }
    const legacy = this.driverAuthService.getCurrentDriver();
    if (legacy?.firstName || legacy?.lastName) {
      return `${legacy.firstName || ''} ${legacy.lastName || ''}`.trim();
    }
    const user = this.authService.getCurrentUser();
    if (user?.firstName || user?.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return 'Livreur AYYOU';
  }

  get driverPhoto(): string | null {
    const photo = this.realDriverProfile?.photo_avatar || this.realDriverProfile?.permis_conduire;
    if (photo && (photo.startsWith('http') || photo.startsWith('/'))) {
      return photo;
    }
    const user = this.authService.getCurrentUser();
    if (user?.avatarUrl && (user.avatarUrl.startsWith('http') || user.avatarUrl.startsWith('/'))) {
      return user.avatarUrl;
    }
    const legacy = this.driverAuthService.getCurrentDriver() as any;
    if (legacy?.avatar && typeof legacy.avatar === 'string' && (legacy.avatar.startsWith('http') || legacy.avatar.startsWith('/'))) {
      return legacy.avatar;
    }
    return null;
  }

  onBackBtnClick(): void {
    this.backClick.emit();
  }
}
