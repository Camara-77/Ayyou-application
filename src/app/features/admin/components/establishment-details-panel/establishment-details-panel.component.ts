import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EstablishmentDetail, EstablishmentDocument } from '../../models/admin-business.models';

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
  @Output() reject = new EventEmitter<{ id: string; motif: string } | string>();

  selectedImage: string | null = null;
  selectedPdfUrl: SafeResourceUrl | null = null;
  selectedPdfRawUrl: string | null = null;
  selectedDocTitle: string = '';

  showApproveModal: boolean = false;
  showRejectModal: boolean = false;
  showRequestDocsModal: boolean = false;

  docNotes: string = '';
  rejectReason: string = '';

  constructor(private sanitizer: DomSanitizer) {}

  viewDocument(doc: EstablishmentDocument): void {
    if (!doc || !doc.fichierUrl) return;

    this.selectedDocTitle = doc.title;
    const url = doc.fichierUrl;
    if (doc.isPdf || url.toLowerCase().includes('.pdf')) {
      this.selectedPdfRawUrl = url;
      this.selectedPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    } else {
      this.selectedImage = url;
    }
  }

  closePdfPreview(): void {
    this.selectedPdfUrl = null;
    this.selectedPdfRawUrl = null;
  }

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
    this.rejectReason = '';
    this.showRejectModal = true;
  }

  confirmReject(): void {
    if (this.establishment && this.rejectReason && this.rejectReason.trim()) {
      this.reject.emit({ id: this.establishment.id, motif: this.rejectReason.trim() });
      this.showRejectModal = false;
      this.rejectReason = '';
    }
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
    this.rejectReason = '';
  }
}
