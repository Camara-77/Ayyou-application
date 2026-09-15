import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DriverDetail } from '../../models/admin-driver.models';

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
  @Output() reject = new EventEmitter<string>();

  showApproveModal: boolean = false;
  showRejectModal: boolean = false;
  showRequestDocsModal: boolean = false;

  docNotes: string = '';

  defaultDocs = [
    { id: '1', title: 'CNI / Pièce d\'identité', subtitle: 'Recto / Verso validé', isValidated: true },
    { id: '2', title: 'Permis de conduire', subtitle: 'Catégorie A • Exp. 2027', isValidated: true },
    { id: '3', title: 'Casier judiciaire (B3)', subtitle: 'Tribunal Dakar < 3 mois', isValidated: true },
    { id: '4', title: 'Carte grise & Assurance', subtitle: 'Attestation AXA en règle', isValidated: true }
  ];

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
    this.showRejectModal = true;
  }

  confirmReject(): void {
    if (this.driver) {
      this.reject.emit(this.driver.id);
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
