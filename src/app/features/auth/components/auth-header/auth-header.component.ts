import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './auth-header.component.html',
  styleUrl: './auth-header.component.scss'
})
export class AuthHeaderComponent {
  @Input() showBackButton = true;
  @Input() showSkipButton = false;
  @Input() showLogo = false;
  @Input() backUrl?: string;
  @Input() logoUrl = '/assets/branding/logo.svg';

  @Output() backClicked = new EventEmitter<void>();
  @Output() skipClicked = new EventEmitter<void>();

  onBack(): void {
    this.backClicked.emit();
  }

  onSkip(): void {
    this.skipClicked.emit();
  }
}
