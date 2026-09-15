import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-vendor-login-form-card',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './vendor-login-form-card.component.html',
  styleUrls: ['./vendor-login-form-card.component.scss']
})
export class VendorLoginFormCardComponent implements OnInit {
  @Input() isLoading: boolean = false;
  @Input() errorMessage: string | null = null;
  @Input() initialIdentifier: string = '';

  @Output() submitForm = new EventEmitter<{ identifier: string; passwordText: string; remember24h: boolean }>();
  @Output() marchandLogin = new EventEmitter<void>();
  @Output() openRecovery = new EventEmitter<void>();

  identifier: string = '';
  passwordText: string = '';
  remember24h: boolean = true;
  showPassword: boolean = false;

  identifierTouched: boolean = false;
  passwordTouched: boolean = false;

  constructor(private router: Router) {}

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
    const senegalPhoneRegex = /^(?:\+?221)?\s?(7[067853]\d{7})$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return senegalPhoneRegex.test(clean.replace(/\s+/g, '')) || emailRegex.test(clean);
  }

  isPasswordValid(): boolean {
    return !!this.passwordText && this.passwordText.trim().length >= 4;
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
        passwordText: this.passwordText,
        remember24h: this.remember24h
      });
    }
  }

  onRegisterClick(): void {
    this.router.navigate(['/pro/register']);
  }
}
