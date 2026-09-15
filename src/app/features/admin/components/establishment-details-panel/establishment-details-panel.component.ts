import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstablishmentDetail } from '../../models/admin-business.models';

@Component({
  selector: 'app-establishment-details-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './establishment-details-panel.component.html',
  styleUrls: ['./establishment-details-panel.component.scss']
})
export class EstablishmentDetailsPanelComponent {
  @Input() establishment: EstablishmentDetail | null = null;
  @Output() approve = new EventEmitter<string>();
  @Output() reject = new EventEmitter<string>();

  selectedImage: string | null = null;

  showApproveModal: boolean = false;
  showRejectModal: boolean = false;
  showRequestDocsModal: boolean = false;

  docNotes: string = '';

  openImagePreview(photoUrl: string): void {
    this.selectedImage = photoUrl;
  }

  closeImagePreview(): void {
    this.selectedImage = null;
  }

  promptApprove(): void {
    this.showApproveModal = true;
  }

  confirmApprove(): void {
    if (this.establishment) {
      this.approve.emit(this.establishment.id);
    }
    this.showApproveModal = false;
  }

  promptReject(): void {
    this.showRejectModal = true;
  }

  confirmReject(): void {
    if (this.establishment) {
      this.reject.emit(this.establishment.id);
    }
    this.showRejectModal = false;
  }

  promptRequestDocs(): void {
    this.showRequestDocsModal = true;
  }

  sendDocsRequest(): void {
    this.showRequestDocsModal = false;
    this.docNotes = '';
  }

  closeModals(): void {
    this.showApproveModal = false;
    this.showRejectModal = false;
    this.showRequestDocsModal = false;
  }
}
