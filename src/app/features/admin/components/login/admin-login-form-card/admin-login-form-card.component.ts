import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-login-form-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login-form-card.component.html',
  styleUrls: ['./admin-login-form-card.component.scss']
})
export class AdminLoginFormCardComponent {
  @Input() isLoading: boolean = false;
  @Input() errorMessage: string | null = null;
  @Output() submitForm = new EventEmitter<{ email: string; password: string; rememberDevice: boolean }>();
  @Output() googleLogin = new EventEmitter<void>();
  @Output() openRecovery = new EventEmitter<void>();

  email: string = 'mamadou.d@ayyou.sn';
  password: string = '';
  rememberDevice: boolean = true;
  showPassword: boolean = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.email && this.password) {
      this.submitForm.emit({
        email: this.email,
        password: this.password,
        rememberDevice: this.rememberDevice
      });
    }
  }
}
