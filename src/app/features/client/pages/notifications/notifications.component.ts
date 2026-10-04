import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { AppBottomNavComponent } from '../../components/app-bottom-nav/app-bottom-nav.component';
import { PaymentService } from '../../../../core/services/payment.service';
import { OrderService } from '../../../../core/services/order.service';
import { NotificationService, NotificationApiItem } from '../../../../core/services/notification.service';
import { Invoice } from '../../../../core/models/payment';
import { CommandeOrder } from '../../../../core/models/orders';

export type NotificationFilterTab = 'ALL' | 'FACTURES' | 'PLANNING' | 'VIDEOS';

export interface GroupedMealItem {
  id: number;
  nom: string;
  heure: string;
  statut: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    AppHeaderComponent,
    AppBottomNavComponent
  ],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  private paymentService = inject(PaymentService);
  private orderService = inject(OrderService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  apiNotifications: NotificationApiItem[] = [];
  isLoading = true;
  errorMessage = '';

  activeFilter: NotificationFilterTab = 'ALL';

  // Invoice Modal State
  showInvoiceModal: boolean = false;
  activeInvoiceRef: string = 'AYY-20260916-A1B2C3';
  activeInvoice?: Invoice;
  activeCommande?: CommandeOrder;
  activeCodePin: string = '8492';
  isDownloadingInvoice: boolean = false;
  downloadSuccessMessage: boolean = false;

  ngOnInit(): void {
    this.loadNotifications();

    this.route.queryParams.subscribe(params => {
      if (params['receipt'] || params['showReceipt']) {
        const ref = params['receipt'] || 'AYY-20260916-A1B2C3';
        this.openInvoice(ref);
      }
      if (params['filter']) {
        const f = params['filter'].toUpperCase();
        if (f === 'FACTURES' || f === 'PLANNING' || f === 'VIDEOS') {
          this.activeFilter = f as NotificationFilterTab;
        }
      }
    });
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.notificationService.getNotifications().subscribe({
      next: (items) => {
        this.apiNotifications = items || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.detail || "Erreur lors du chargement des notifications.";
      }
    });
  }

  setFilter(filter: NotificationFilterTab): void {
    this.activeFilter = filter;
  }

  // --- FILTRES DE NOTIFICATIONS PAR CATEGORIE ---

  get facturesList(): NotificationApiItem[] {
    return this.apiNotifications.filter(n =>
      n.type_notification === 'ORDER' || n.reference_type === 'Commande'
    );
  }

  get planningList(): NotificationApiItem[] {
    return this.apiNotifications.filter(n =>
      n.type_notification === 'RAPPEL_REPAS_PLANIFIE' ||
      n.reference_type === 'RepasPlanifie' ||
      n.reference_type === 'planning'
    );
  }

  get videosList(): NotificationApiItem[] {
    return this.apiNotifications.filter(n =>
      n.type_notification === 'PUBLICATION_VIDEO' ||
      n.reference_type === 'PublicationFeed'
    );
  }

  get unreadFacturesCount(): number {
    return this.facturesList.filter(n => !n.est_lu).length;
  }

  get unreadPlanningCount(): number {
    return this.planningList.filter(n => !n.est_lu).length;
  }

  get unreadVideosCount(): number {
    return this.videosList.filter(n => !n.est_lu).length;
  }

  get totalCount(): number {
    return this.apiNotifications.length > 0 ? this.apiNotifications.length : 4;
  }

  // --- LOGIQUE DU DÉCLENCHEMENT ET DES ACTIONS ---

  onNotificationClick(item: NotificationApiItem, event?: Event): void {
    if (event) event.stopPropagation();

    if (!item.est_lu && item.id > 0) {
      this.notificationService.markAsRead(item.id).subscribe({
        next: () => {
          item.est_lu = true;
        }
      });
    }

    if (item.type_notification === 'ORDER' || item.reference_type === 'Commande') {
      const ref = item.reference_id || item.metadata?.commande_id || 'AYY-20260916-A1B2C3';
      const pin = item.metadata?.code_pin || '8492';
      this.openInvoice(ref, pin);
    } else if (
      item.type_notification === 'RAPPEL_REPAS_PLANIFIE' ||
      item.reference_type === 'RepasPlanifie'
    ) {
      const planningId = item.reference_id || item.metadata?.planning_id;
      if (planningId) {
        this.router.navigate(['/planning/detail', planningId]);
      } else {
        this.router.navigate(['/planning']);
      }
    } else if (
      item.type_notification === 'PUBLICATION_VIDEO' ||
      item.reference_type === 'PublicationFeed'
    ) {
      const pubId = item.reference_id || item.metadata?.publication_id || '1';
      this.router.navigate(['/feed/video', pubId]);
    }
  }

  openInvoice(ref?: string, codePin?: string, event?: Event): void {
    if (event) event.stopPropagation();
    this.activeInvoiceRef = ref || 'AYY-20260916-A1B2C3';
    this.activeCodePin = codePin || '8492';
    this.showInvoiceModal = true;
    this.downloadSuccessMessage = false;

    // Récupérer la facture réelle depuis l'API backend si disponible
    this.paymentService.getInvoices().subscribe({
      next: (invoices: Invoice[]) => {
        if (invoices && invoices.length > 0) {
          const matched = invoices.find(inv =>
            inv.numero_facture === ref ||
            inv.commande_numero === ref ||
            String(inv.commande) === String(ref) ||
            String(inv.commande_id) === String(ref) ||
            String(inv.id) === String(ref)
          );
          if (matched) {
            this.activeInvoice = matched;
          }
        }
      },
      error: () => {}
    });

    // Optionnel : charger la commande pour les détails d'articles
    const cmdId = parseInt(this.activeInvoiceRef, 10);
    if (!isNaN(cmdId)) {
      this.orderService.getOrderById(cmdId).subscribe({
        next: (cmd: CommandeOrder) => {
          this.activeCommande = cmd;
        },
        error: () => {}
      });
    }
  }

  closeInvoice(): void {
    this.showInvoiceModal = false;
  }

  navigateToTracking(event?: Event): void {
    if (event) event.stopPropagation();
    const targetId = this.activeInvoice?.commande_id || this.activeInvoiceRef || '1';
    this.closeInvoice();
    this.router.navigate(['/order-tracking', targetId]);
  }

  downloadInvoicePdf(): void {
    this.isDownloadingInvoice = true;
    setTimeout(() => {
      this.isDownloadingInvoice = false;
      this.downloadSuccessMessage = true;

      const numFacture = this.activeInvoice?.numero_facture || `FAC-${this.activeInvoiceRef}`;
      const totalText = this.activeInvoice ? `${parseFloat(this.activeInvoice.montant_total).toLocaleString('fr-FR')} FCFA` : '4 500 FCFA';

      const element = document.createElement('a');
      const file = new Blob([
        `==================================================\n` +
        `            FACTURE & REÇU OFFICIEL AYYOU         \n` +
        `==================================================\n` +
        `N° Facture : ${numFacture}\n` +
        `Code PIN : ${this.activeCodePin}\n` +
        `Client : ${this.activeInvoice?.nom_client_snapshot || 'Client AYYOU'}\n` +
        `Adresse : ${this.activeInvoice?.adresse_livraison_snapshot || 'Dakar, Sénégal'}\n` +
        `Date : ${this.activeInvoice?.date_emission ? new Date(this.activeInvoice.date_emission).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR')}\n` +
        `--------------------------------------------------\n` +
        `TOTAL RÉGLÉ :                      ${totalText}\n` +
        `Statut : ${this.activeInvoice?.est_payee !== false ? 'PAYÉE' : 'EN ATTENTE'}\n` +
        `==================================================\n` +
        `            Merci d'avoir choisi AYYOU !           \n` +
        `==================================================\n`
      ], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `Facture_${numFacture}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 1000);
  }

  // --- CONVERTISSEUR DE TEMPS RELATIF EN FRANÇAIS ---

  getRelativeTime(dateStr?: string): string {
    if (!dateStr) return "À l'instant";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 2) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
}
