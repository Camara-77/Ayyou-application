import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-vendor-password-recovery-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vendor-password-recovery-modal.component.html',
  styleUrls: ['./vendor-password-recovery-modal.component.scss']
})
export class VendorPasswordRecoveryModalComponent {
  @Input() isLoading: boolean = false;
  @Input() errorMessage: string | null = null;
  @Output() requestRecovery = new EventEmitter<string>();
  @Output() closeModal = new EventEmitter<void>();

  identifier: string = '';
  isSuccess: boolean = false;

  onSubmit(): void {
    if (this.identifier) {
      this.requestRecovery.emit(this.identifier.trim());
    }
  }

  setSuccessState(): void {
    this.isSuccess = true;
  }

  onCancel(): void {
    this.closeModal.emit();
  }
}
