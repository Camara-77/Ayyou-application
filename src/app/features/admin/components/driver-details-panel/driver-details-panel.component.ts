import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DriverDetail, DriverDocument } from '../../models/admin-driver.models';
import { resolveMediaUrl } from '../../services/admin-driver.service';

@Component({
  selector: 'app-driver-details-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './driver-details-panel.component.html',
  styleUrls: ['./driver-details-panel.component.scss']
})
export class DriverDetailsPanelComponent {
  @Input() driver: DriverDetail | null = null;
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

  viewDocument(doc: DriverDocument): void {
    if (!doc || !doc.fichierUrl) return;

    this.selectedDocTitle = doc.title;
    const url = resolveMediaUrl(doc.fichierUrl);
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

  closeImagePreview(): void {
    this.selectedImage = null;
  }

  promptApprove(): void {
    this.showApproveModal = true;
  }

  confirmApprove(): void {
    if (this.driver) {
      this.approve.emit(this.driver.id);
    }
    this.showApproveModal = false;
  }

  promptReject(): void {
    this.rejectReason = '';
    this.showRejectModal = true;
  }

  confirmReject(): void {
    if (this.driver && this.rejectReason && this.rejectReason.trim()) {
      this.reject.emit({ id: this.driver.id, motif: this.rejectReason.trim() });
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
