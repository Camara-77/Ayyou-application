import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeliveryItem, DeliveryTimelineEvent } from '../../models/admin-delivery.models';

@Component({
  selector: 'app-delivery-details-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delivery-details-panel.component.html',
  styleUrls: ['./delivery-details-panel.component.scss']
})
export class DeliveryDetailsPanelComponent {
  @Input() delivery: DeliveryItem | null = null;
  @Input() timelineEvents: DeliveryTimelineEvent[] = [];

  @Output() closePanel = new EventEmitter<void>();
  @Output() reassign = new EventEmitter<DeliveryItem>();
  @Output() closeIncident = new EventEmitter<DeliveryItem>();
  @Output() callCourier = new EventEmitter<DeliveryItem>();
  @Output() contactClient = new EventEmitter<DeliveryItem>();

  showReassignModal = false;
  selectedRelayCourier = '';

  relayCouriersList = [
    'Mamadou Ndiaye (Scooter Kymco Agility - Almadies à 300m)',
    'Pathé Seck (Honda PCX 150cc - Ngor à 500m)',
    'Modou Fall (Boxer 150 - Ouakam à 900m)'
  ];

  onClose(): void {
    this.closePanel.emit();
  }

  onReassignClick(): void {
    this.showReassignModal = true;
  }

  confirmReassign(): void {
    if (this.delivery && this.selectedRelayCourier) {
      this.reassign.emit(this.delivery);
      this.showReassignModal = false;
    }
  }

  onCloseIncidentClick(): void {
    if (this.delivery) {
      if (confirm(`Confirmer la clôture de l'incident sur la course ${this.delivery.reference} ?`)) {
        this.closeIncident.emit(this.delivery);
      }
    }
  }

  onCallCourierClick(): void {
    if (this.delivery) {
      this.callCourier.emit(this.delivery);
    }
  }

  onContactClientClick(): void {
    if (this.delivery) {
      this.contactClient.emit(this.delivery);
    }
  }
}
