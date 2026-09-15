import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-password-recovery-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-password-recovery-modal.component.html',
  styleUrls: ['./admin-password-recovery-modal.component.scss']
})
export class AdminPasswordRecoveryModalComponent {
  @Input() isLoading: boolean = false;
  @Input() errorMessage: string | null = null;
  @Output() requestRecovery = new EventEmitter<string>();
  @Output() closeModal = new EventEmitter<void>();

  email: string = '';
  isSuccess: boolean = false;

  onSubmit(): void {
    if (this.email && this.email.includes('@')) {
      this.requestRecovery.emit(this.email);
    }
  }

  setSuccessState(): void {
    this.isSuccess = true;
  }

  onCancel(): void {
    this.closeModal.emit();
  }
}
