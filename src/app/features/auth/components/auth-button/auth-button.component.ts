import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth-button.component.html',
  styleUrl: './auth-button.component.scss'
})
export class AuthButtonComponent {
  @Input() text = '';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() type: 'button' | 'submit' = 'submit';

  @Output() buttonClick = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.buttonClick.emit(event);
    }
  }
}
