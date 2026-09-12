import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-social-login-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './social-login-button.component.html',
  styleUrl: './social-login-button.component.scss'
})
export class SocialLoginButtonComponent {
  @Input() provider: 'google' | 'faceid' = 'google';
  @Input() label?: string;
  @Input() disabled = false;

  @Output() socialClick = new EventEmitter<string>();

  get buttonLabel(): string {
    if (this.label) {
      return this.label;
    }
    return this.provider === 'google' ? 'Continuer avec Google' : 'Connexion avec Face ID';
  }

  onClick(): void {
    if (!this.disabled) {
      this.socialClick.emit(this.provider);
    }
  }
}
