import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EstablishmentDetail, EstablishmentDocument, AiDocumentAnalysisReport } from '../../models/admin-business.models';
import { AdminBusinessService } from '../../services/admin-business.service';

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

  isAnalyzing: boolean = false;
  analysisError: string = '';

  constructor(
    private sanitizer: DomSanitizer,
    private businessService: AdminBusinessService
  ) {}

  analyzeWithCopilot(): void {
    if (!this.establishment || !this.establishment.id || this.isAnalyzing) return;

    this.isAnalyzing = true;
    this.analysisError = '';

    this.businessService.analyzeDocumentsWithCopilot(this.establishment.id).subscribe({
      next: (report: AiDocumentAnalysisReport) => {
        this.isAnalyzing = false;
        if (this.establishment) {
          this.establishment.aiAnalysisReport = report;
        }
      },
      error: (err) => {
        this.isAnalyzing = false;
        console.error('Erreur lors de l\'analyse Copilot:', err);
        this.analysisError = 'Impossible de contacter AYYOU Copilot. Veuillez réessayer.';
      }
    });
  }

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
    const report = this.establishment?.aiAnalysisReport;
    if (report && report.rejection_reasons && report.rejection_reasons.length > 0) {
      this.rejectReason = report.rejection_reasons.map(r => `• ${r}`).join('\n');
    } else if (report && report.inconsistencies && report.inconsistencies.length > 0) {
      this.rejectReason = report.inconsistencies.map(inc => `• ${inc}`).join('\n');
    } else {
      this.rejectReason = '';
    }
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
