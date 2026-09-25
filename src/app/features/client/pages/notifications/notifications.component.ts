import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { AppBottomNavComponent } from '../../components/app-bottom-nav/app-bottom-nav.component';
import { ChatbotFloatingComponent } from '../../components/chatbot-floating/chatbot-floating.component';
import { ClientDataService } from '../../../../core/services/client-data.service';
import { PaymentService } from '../../../../core/services/payment.service';
import { NotificationService, NotificationApiItem } from '../../../../core/services/notification.service';
import { Invoice } from '../../../../core/models/payment';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    AppHeaderComponent,
    AppBottomNavComponent,
    ChatbotFloatingComponent
  ],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  private clientDataService = inject(ClientDataService);
  private paymentService = inject(PaymentService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);

  apiNotifications: NotificationApiItem[] = [];
  isLoading = true;
  errorMessage = '';

  searchQuery: string = '';
  showInvoiceModal: boolean = false;
  activeInvoiceRef: string = 'AY-9482';
  activeInvoice?: Invoice;
  isDownloadingInvoice: boolean = false;
  downloadSuccessMessage: boolean = false;

  ngOnInit(): void {
    this.loadNotifications();

    this.route.queryParams.subscribe(params => {
      if (params['receipt'] || params['showReceipt']) {
        const ref = params['receipt'] || 'AY-9482';
        this.openInvoice(ref);
      }
    });
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.notificationService.getNotifications().subscribe({
      next: (items) => {
        this.apiNotifications = items;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.detail || "Erreur de chargement des notifications.";
      }
    });
  }

  onNotificationClick(item: NotificationApiItem): void {
    if (!item.est_lu) {
      this.notificationService.markAsRead(item.id).subscribe({
        next: (updated) => {
          item.est_lu = true;
          item.statut = updated.statut;
        }
      });
    }
    if (item.reference_type === 'Commande' || item.type_notification === 'ORDER') {
      if (item.reference_id) {
        this.openInvoice(item.reference_id);
      }
    }
  }

  get filteredNotifications(): NotificationApiItem[] {
    if (!this.searchQuery.trim()) return this.apiNotifications;
    const q = this.searchQuery.toLowerCase().trim();
    return this.apiNotifications.filter(n =>
      n.titre.toLowerCase().includes(q) ||
      n.message.toLowerCase().includes(q) ||
      n.reference_id.toLowerCase().includes(q)
    );
  }

  openInvoice(ref?: string): void {
    this.activeInvoiceRef = ref || 'AY-9482';
    this.showInvoiceModal = true;
    this.downloadSuccessMessage = false;

    // Récupérer les factures réelles depuis l'API backend
    this.paymentService.getInvoices().subscribe({
      next: (invoices: Invoice[]) => {
        if (invoices && invoices.length > 0) {
          const matched = invoices.find(inv =>
            inv.numero_facture === ref ||
            inv.commande_numero === ref ||
            String(inv.id) === ref
          ) || invoices[0];
          this.activeInvoice = matched;
        }
      },
      error: () => {}
    });
  }

  closeInvoice(): void {
    this.showInvoiceModal = false;
  }

  downloadInvoicePdf(): void {
    this.isDownloadingInvoice = true;
    setTimeout(() => {
      this.isDownloadingInvoice = false;
      this.downloadSuccessMessage = true;

      const numFacture = this.activeInvoice?.numero_facture || `FAC-${this.activeInvoiceRef}`;
      const totalText = this.activeInvoice ? `${parseFloat(this.activeInvoice.montant_total).toLocaleString('fr-FR')} FCFA` : '11 500 FCFA';

      const element = document.createElement('a');
      const file = new Blob([
        `==================================================\n` +
        `            FACTURE & REÇU OFFICIEL AYYOU         \n` +
        `==================================================\n` +
        `N° Facture : ${numFacture}\n` +
        `Client : ${this.activeInvoice?.nom_client_snapshot || 'Alia Ndiaye'}\n` +
        `Adresse : ${this.activeInvoice?.adresse_livraison_snapshot || 'Dakar, Sénégal'}\n` +
        `Date : ${this.activeInvoice?.date_emission ? new Date(this.activeInvoice.date_emission).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR')}\n` +
        `--------------------------------------------------\n` +
        `TOTAL RÉGLÉ :                      ${totalText}\n` +
        `Statut : ${this.activeInvoice?.est_payee ? 'PAYÉE' : 'EN ATTENTE'}\n` +
        `==================================================\n` +
        `            Merci d'avoir choisi AYYOU !           \n` +
        `==================================================\n`
      ], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `Facture_${numFacture}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 1200);
  }
}
