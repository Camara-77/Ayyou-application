import { Component, inject, OnInit, OnDestroy, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthHeaderComponent } from '../../components/auth-header/auth-header.component';
import { AuthButtonComponent } from '../../components/auth-button/auth-button.component';

@Component({
  selector: 'app-verify-sms',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AuthHeaderComponent,
    AuthButtonComponent
  ],
  templateUrl: './verify-sms.component.html',
  styleUrl: './verify-sms.component.scss'
})
export class VerifySmsComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  @ViewChildren('otpInput') otpInputRefs!: QueryList<ElementRef<HTMLInputElement>>;

  phoneNumber = '+33 6 12 34 56 78';
  timerSeconds = 47;
  isResendDisabled = true;
  loading = false;
  errorMessage: string | null = null;
  resendMessage: string | null = null;

  private timerInterval: any;

  otpForm: FormGroup = this.fb.group({
    digits: this.fb.array(
      Array(6).fill('').map(() => this.fb.control('', [Validators.required, Validators.pattern('^[0-9]$')]))
    )
  });

  get digitsArray(): FormArray {
    return this.otpForm.get('digits') as FormArray;
  }

  get otpCode(): string {
    return this.digitsArray.controls.map(c => c.value).join('');
  }

  get isOtpComplete(): boolean {
    return this.otpCode.length === 6 && /^[0-9]{6}$/.test(this.otpCode);
  }

  get formattedTimer(): string {
    const mins = Math.floor(this.timerSeconds / 60);
    const secs = this.timerSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  ngOnInit(): void {
    this.startResendTimer();
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  startResendTimer(): void {
    this.clearTimer();
    this.timerSeconds = 47;
    this.isResendDisabled = true;

    this.timerInterval = setInterval(() => {
      if (this.timerSeconds > 0) {
        this.timerSeconds--;
      } else {
        this.isResendDisabled = false;
        this.clearTimer();
      }
    }, 1000);
  }

  clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Reject non-numeric input
    if (value && !/^[0-9]$/.test(value)) {
      this.digitsArray.controls[index].setValue('');
      return;
    }

    if (value && index < 5) {
      const inputs = this.otpInputRefs.toArray();
      inputs[index + 1].nativeElement.focus();
    }

    this.errorMessage = null;
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace') {
      const currentValue = this.digitsArray.controls[index].value;
      if (!currentValue && index > 0) {
        const inputs = this.otpInputRefs.toArray();
        inputs[index - 1].nativeElement.focus();
      }
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData.replace(/[^0-9]/g, '').slice(0, 6);

    if (digits.length > 0) {
      digits.split('').forEach((char, idx) => {
        if (idx < 6) {
          this.digitsArray.controls[idx].setValue(char);
        }
      });
      const inputs = this.otpInputRefs.toArray();
      const focusIndex = Math.min(digits.length, 5);
      if (inputs[focusIndex]) {
        inputs[focusIndex].nativeElement.focus();
      }
    }
  }

  resendCode(): void {
    if (this.isResendDisabled) return;
    this.resendMessage = 'Un nouveau code SMS a été envoyé.';
    setTimeout(() => (this.resendMessage = null), 4000);
    this.startResendTimer();
  }

  onBack(): void {
    this.router.navigate(['/register']);
  }

  onModifyNumber(): void {
    this.router.navigate(['/register']);
  }

  onSubmit(): void {
    if (!this.isOtpComplete) return;

    this.loading = true;
    this.errorMessage = null;

    setTimeout(() => {
      this.loading = false;
      // Mock validation: code "123456" or any 6-digit code for dev testing
      if (this.otpCode === '123456' || this.otpCode.length === 6) {
        this.router.navigate(['/location']);
      } else {
        this.errorMessage = 'Code de vérification incorrect. Veuillez réessayer.';
      }
    }, 400);
  }
}
