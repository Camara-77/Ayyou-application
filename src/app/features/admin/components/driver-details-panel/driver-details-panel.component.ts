import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DriverDetail, DriverDocument, AiDriverAnalysisReport } from '../../models/admin-driver.models';
import { resolveMediaUrl, AdminDriverService } from '../../services/admin-driver.service';

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

  isAnalyzing: boolean = false;
  analysisError: string = '';

  constructor(
    private sanitizer: DomSanitizer,
    private driverService: AdminDriverService
  ) {}

  analyzeWithCopilot(): void {
    if (!this.driver || !this.driver.id || this.isAnalyzing) return;

    this.isAnalyzing = true;
    this.analysisError = '';

    this.driverService.analyzeDocumentsWithCopilot(this.driver.id).subscribe({
      next: (report: AiDriverAnalysisReport) => {
        this.isAnalyzing = false;
        if (this.driver) {
          this.driver.aiAnalysisReport = report;
        }
      },
      error: (err) => {
        this.isAnalyzing = false;
        console.error('Erreur lors de l\'analyse Copilot livreur:', err);
        this.analysisError = 'Impossible de contacter AYYOU Copilot. Veuillez réessayer.';
      }
    });
  }

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
    const report = this.driver?.aiAnalysisReport;
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
