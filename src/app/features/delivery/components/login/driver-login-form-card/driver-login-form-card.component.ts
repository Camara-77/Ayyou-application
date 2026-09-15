import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-driver-login-form-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './driver-login-form-card.component.html',
  styleUrls: ['./driver-login-form-card.component.scss']
})
export class DriverLoginFormCardComponent implements OnInit {
  @Input() isLoading: boolean = false;
  @Input() errorMessage: string | null = null;
  @Input() initialIdentifier: string = '';

  @Output() submitForm = new EventEmitter<{ identifier: string; passwordPin: string; rememberMe: boolean }>();
  @Output() openRecovery = new EventEmitter<void>();

  identifier: string = '';
  passwordPin: string = '';
  rememberMe: boolean = true;
  showPassword: boolean = false;

  identifierTouched: boolean = false;
  passwordTouched: boolean = false;

  ngOnInit(): void {
    if (this.initialIdentifier) {
      this.identifier = this.initialIdentifier;
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  isIdentifierValid(): boolean {
    if (!this.identifier) return false;
    const clean = this.identifier.trim();
    // Senegal phone validation (9 digits starting with 77, 78, 76, 70, 75, 33) or valid email
    const senegalPhoneRegex = /^(?:\+?221)?\s?(7[067853]\d{7})$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return senegalPhoneRegex.test(clean.replace(/\s+/g, '')) || emailRegex.test(clean);
  }

  isPasswordValid(): boolean {
    return !!this.passwordPin && this.passwordPin.trim().length >= 4;
  }

  isFormValid(): boolean {
    return this.isIdentifierValid() && this.isPasswordValid();
  }

  onSubmit(): void {
    this.identifierTouched = true;
    this.passwordTouched = true;

    if (this.isFormValid()) {
      this.submitForm.emit({
        identifier: this.identifier.trim(),
        passwordPin: this.passwordPin,
        rememberMe: this.rememberMe
      });
    }
  }
}
