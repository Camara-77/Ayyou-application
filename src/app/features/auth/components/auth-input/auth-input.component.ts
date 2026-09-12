import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './auth-input.component.html',
  styleUrl: './auth-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AuthInputComponent),
      multi: true
    }
  ]
})
export class AuthInputComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() rightLinkLabel?: string;
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() icon: 'user' | 'password' | 'none' = 'none';
  @Input() errorMessage?: string;
  @Input() isError = false;
  @Input() inputId = `auth-input-${Math.random().toString(36).substring(2, 9)}`;

  @Output() rightLinkClick = new EventEmitter<void>();

  value = '';
  disabled = false;
  showPassword = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  get inputType(): string {
    if (this.type === 'password') {
      return this.showPassword ? 'text' : 'password';
    }
    return this.type;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onRightLinkClick(event: MouseEvent): void {
    event.preventDefault();
    this.rightLinkClick.emit();
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
