import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-two-factor-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-two-factor-modal.component.html',
  styleUrls: ['./admin-two-factor-modal.component.scss']
})
export class AdminTwoFactorModalComponent {
  @Input() isLoading: boolean = false;
  @Input() errorMessage: string | null = null;
  @Output() verifyCode = new EventEmitter<string>();
  @Output() closeModal = new EventEmitter<void>();

  digits: string[] = ['', '', '', '', '', ''];

  onDigitInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (value && index < 5) {
      const nextInput = input.parentElement?.children[index + 1] as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.digits[index] && index > 0) {
      const prevInput = (event.target as HTMLElement).parentElement?.children[index - 1] as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text') || '';
    const numericCode = pasted.replace(/\D/g, '').slice(0, 6);
    
    for (let i = 0; i < 6; i++) {
      this.digits[i] = numericCode[i] || '';
    }
  }

  onVerify(): void {
    const fullCode = this.digits.join('');
    if (fullCode.length === 6) {
      this.verifyCode.emit(fullCode);
    }
  }

  onCancel(): void {
    this.closeModal.emit();
  }
}
