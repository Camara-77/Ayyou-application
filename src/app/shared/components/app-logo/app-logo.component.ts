import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="app-logo-wrapper" [ngClass]="customClass">
      <img
        src="assets/branding/logo-ayyou.png"
        alt="AYYOU"
        [style.height.px]="height"
        [style.width]="width ? width + 'px' : 'auto'"
        class="ayyou-official-logo"
      />
      <span *ngIf="badgeText" class="logo-badge" [ngClass]="badgeClass">{{ badgeText }}</span>
    </div>
  `,
  styles: [`
    .app-logo-wrapper {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      vertical-align: middle;
    }
    .ayyou-official-logo {
      object-fit: contain;
      display: block;
      max-width: 100%;
    }
    .logo-badge {
      font-size: 0.65rem;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      line-height: 1;
    }
    .badge-pro {
      background-color: #E51A29;
      color: #FFFFFF;
    }
    .badge-admin {
      background-color: #1A1A1A;
      color: #FFFFFF;
    }
    .badge-driver {
      background-color: #16A34A;
      color: #FFFFFF;
    }
  `]
})
export class AppLogoComponent {
  @Input() height: number = 32;
  @Input() width?: number;
  @Input() badgeText?: string;
  @Input() badgeClass: string = 'badge-pro';
  @Input() customClass: string = '';
}
