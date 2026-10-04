import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PaymentService } from '../../../../core/services/payment.service';
import { OrderService } from '../../../../core/services/order.service';
import { CartService } from '../../../../core/services/cart.service';
import { CommandeOrder, OrderLine } from '../../../../core/models/orders';
import { Invoice, Payment } from '../../../../core/models/payment';
import { Subscription, interval } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-checkout-confirm',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './checkout-confirm.component.html',
  styleUrls: ['./checkout-confirm.component.scss']
})
export class CheckoutConfirmComponent implements OnInit, OnDestroy {
  isLoading = true;
  isSuccess = false;
  isPendingVerification = false;
  errorMessage = '';

  orderId: string = '';
  reference: string = '';
  orderData?: CommandeOrder;
  invoiceData?: Invoice;
  paymentData?: Payment;

  isDownloadingPdf = false;
  downloadSuccessMessage = false;
  showBrandText = false;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private paymentService = inject(PaymentService);
  private orderService = inject(OrderService);
  private cartService = inject(CartService);

  private pollSubscription?: Subscription;
  private pollCount = 0;

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    const token = params['token'] || params['paytech_token'];
    const ref = params['ref_command'] || params['reference'];
    const orderIdParam = params['order_id'] || params['commande_id'];

    // Panier vidé au retour post-paiement
    this.cartService.clearCart().subscribe();

    if (orderIdParam) {
      this.orderId = String(orderIdParam);
      this.reference = ref || `PAY-${orderIdParam}`;
      this.fetchOrderAndInvoiceData(this.orderId);
    } else if (ref || token) {
      this.reference = ref || 'Paiement Wave/PayTech';
      this.findOrderByReferenceOrToken(ref, token);
    } else {
      this.fetchLatestClientOrder();
    }
  }

  fetchOrderAndInvoiceData(orderId: string): void {
    this.isLoading = true;
    this.orderService.getOrderById(orderId).subscribe({
      next: (order: CommandeOrder) => {
        this.orderData = order;
        this.reference = order.numero_commande || this.reference;

        if (this.isOrderConfirmed(order.statut)) {
          this.isLoading = false;
          this.isSuccess = true;
          this.isPendingVerification = false;
          this.fetchInvoiceData(order.id, order.numero_commande);
        } else {
          const params = this.route.snapshot.queryParams;
          const token = params['token'] || params['paytech_token'];
          const ref = params['ref_command'] || params['reference'] || order.numero_commande;

          this.paymentService.confirmPayTechFallback({
            order_id: order.id,
            reference: ref,
            token: token
          }).subscribe({
            next: (res) => {
              if (res && (res.statut === 'PAYEE' || res.statut === 'PAYE')) {
                this.orderService.getOrderById(orderId).subscribe(updatedOrder => {
                  this.orderData = updatedOrder;
                  this.isLoading = false;
                  this.isSuccess = true;
                  this.isPendingVerification = false;
                  this.fetchInvoiceData(updatedOrder.id, updatedOrder.numero_commande);
                });
              } else {
                this.isPendingVerification = true;
                this.startPolling(order.id);
              }
            },
            error: () => {
              this.isPendingVerification = true;
              this.startPolling(order.id);
            }
          });
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = "Impossible de récupérer les détails de la commande.";
      }
    });
  }

  findOrderByReferenceOrToken(ref?: string, token?: string): void {
    this.paymentService.getPayments().subscribe({
      next: (payments: Payment[]) => {
        const found = payments.find(p =>
          (ref && p.reference === ref) ||
          (token && p.transaction_externe === token)
        );
        const targetCmdId = found?.commande_id || found?.commande;
        if (found && targetCmdId) {
          this.orderId = String(targetCmdId);
          this.paymentData = found;
          this.fetchOrderAndInvoiceData(this.orderId);
        } else {
          this.fetchLatestClientOrder();
        }
      },
      error: () => this.fetchLatestClientOrder()
    });
  }

  fetchLatestClientOrder(): void {
    this.orderService.getOrders().subscribe({
      next: (orders: CommandeOrder[]) => {
        if (orders && orders.length > 0) {
          const latest = orders[0];
          this.orderId = String(latest.id);
          this.orderData = latest;
          this.reference = latest.numero_commande;

          if (this.isOrderConfirmed(latest.statut)) {
            this.isLoading = false;
            this.isSuccess = true;
            this.fetchInvoiceData(latest.id, latest.numero_commande);
          } else {
            this.isPendingVerification = true;
            this.startPolling(latest.id);
          }
        } else {
          this.isLoading = false;
          this.errorMessage = "Aucune commande trouvée.";
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = "Impossible de charger la commande.";
      }
    });
  }

  private isOrderConfirmed(statut: string): boolean {
    const s = statut ? statut.toUpperCase() : '';
    return ['PAYEE', 'EN_PREPARATION', 'PRETE', 'EN_LIVRAISON', 'LIVREE'].includes(s);
  }

  startPolling(orderId: number | string): void {
    this.pollCount = 0;
    this.pollSubscription = interval(2500).pipe(
      takeWhile(() => this.pollCount < 12 && !this.isSuccess)
    ).subscribe(() => {
      this.pollCount++;
      this.orderService.getOrderById(orderId).subscribe({
        next: (order: CommandeOrder) => {
          this.orderData = order;
          if (this.isOrderConfirmed(order.statut)) {
            this.isSuccess = true;
            this.isLoading = false;
            this.isPendingVerification = false;
            this.fetchInvoiceData(order.id, order.numero_commande);
            this.pollSubscription?.unsubscribe();
          }
        }
      });

      if (this.pollCount >= 12 && !this.isSuccess) {
        this.isLoading = false;
        this.isPendingVerification = true;
      }
    });
  }

  fetchInvoiceData(orderId: number | string, numCommande?: string, retryCount = 0): void {
    this.paymentService.getInvoices().subscribe({
      next: (invoices: Invoice[]) => {
        if (invoices && invoices.length > 0) {
          const matched = invoices.find(inv =>
            String(inv.commande) === String(orderId) ||
            String(inv.commande_id) === String(orderId) ||
            inv.commande_numero === numCommande
          );
          if (matched) {
            this.invoiceData = matched;
            return;
          }
        }
        if (retryCount < 5) {
          setTimeout(() => this.fetchInvoiceData(orderId, numCommande, retryCount + 1), 1000);
        }
      }
    });
  }

  downloadInvoicePdf(): void {
    const targetInvoiceId = this.invoiceData?.id;
    if (!targetInvoiceId) return;

    this.isDownloadingPdf = true;
    this.downloadSuccessMessage = false;

    this.paymentService.downloadInvoicePdf(targetInvoiceId).subscribe({
      next: (blob: Blob) => {
        this.isDownloadingPdf = false;
        this.downloadSuccessMessage = true;

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `facture_${this.invoiceData?.numero_facture || 'official'}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.isDownloadingPdf = false;
      }
    });
  }

  getInvoiceDateFormatted(): string {
    const rawDate = this.invoiceData?.date_emission || this.invoiceData?.date_paiement || this.orderData?.date_creation;
    if (!rawDate) return '';
    const dateObj = new Date(rawDate);
    if (isNaN(dateObj.getTime())) return String(rawDate);
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  getShortOrderRef(): string {
    const num = this.orderData?.numero_commande || this.invoiceData?.commande_numero || '';
    if (!num) return '';
    if (num.length > 4) {
      return `AY • ${num.slice(-4)}`;
    }
    return num;
  }

  getEtablissementNom(): string {
    if (this.orderData?.sous_commandes && this.orderData.sous_commandes.length > 0) {
      const sc = this.orderData.sous_commandes[0];
      if (sc.etablissement_nom) return sc.etablissement_nom;
    }
    if (this.invoiceData?.details_lignes_snapshot && this.invoiceData.details_lignes_snapshot.length > 0) {
      return this.invoiceData.details_lignes_snapshot[0].etablissement;
    }
    return 'Chez Loutcha';
  }

  getEtablissementSpecialite(): string {
    if (this.orderData?.sous_commandes && this.orderData.sous_commandes.length > 0) {
      const sc = this.orderData.sous_commandes[0];
      if (sc.etablissement_specialite) return sc.etablissement_specialite;
    }
    return 'Cuisine sénégalaise & Africaine';
  }

  getInvoiceArticles(): { quantite: number; nom: string; prix: string }[] {
    if (this.invoiceData?.details_lignes_snapshot && this.invoiceData.details_lignes_snapshot.length > 0) {
      return this.invoiceData.details_lignes_snapshot.map(item => ({
        quantite: item.quantite,
        nom: item.produit,
        prix: this.formatPrice(item.total_ligne)
      }));
    }
    return this.getAllOrderLines().map(line => ({
      quantite: line.quantite,
      nom: line.nom_produit_snapshot,
      prix: this.formatPrice(line.total_ligne)
    }));
  }

  getAllOrderLines(): OrderLine[] {
    if (!this.orderData || !this.orderData.sous_commandes) return [];
    const lines: OrderLine[] = [];
    for (const sc of this.orderData.sous_commandes) {
      if (sc.lignes) {
        lines.push(...sc.lignes);
      }
    }
    return lines;
  }

  getSousTotal(): string | number {
    if (this.invoiceData?.montant_ht) return this.invoiceData.montant_ht;
    if (this.orderData?.sous_total) return this.orderData.sous_total;
    return 0;
  }

  getFraisLivraison(): string | number {
    if (this.invoiceData?.frais_livraison !== undefined) return this.invoiceData.frais_livraison;
    if (this.orderData?.frais_livraison !== undefined) return this.orderData.frais_livraison;
    return 0;
  }

  getTotalPaid(): string | number {
    if (this.invoiceData?.montant_total) return this.invoiceData.montant_total;
    if (this.orderData?.total) return this.orderData.total;
    return 0;
  }

  getPaymentMethodName(): string {
    if (this.paymentData?.methode_nom) return this.paymentData.methode_nom;
    if (this.orderData?.mode_paiement) {
      const m = this.orderData.mode_paiement.toUpperCase();
      if (m.includes('WAVE')) return 'Wave';
      if (m.includes('ORANGE') || m.includes('OM')) return 'Orange Money';
      if (m.includes('CARTE')) return 'Carte Bancaire';
      if (m.includes('CASH') || m.includes('ESPECES')) return 'Espèces à la livraison';
      return this.orderData.mode_paiement;
    }
    return 'Wave / Orange Money';
  }

  formatPrice(val: string | number): string {
    const n = parseFloat(String(val || 0));
    return n.toLocaleString('fr-FR') + ' F CFA';
  }

  navigateToTracking(): void {
    const targetId = this.orderId || (this.orderData ? String(this.orderData.id) : '1');
    this.router.navigate(['/order-tracking', targetId]);
  }

  retryCheckout(): void {
    this.router.navigate(['/cart']);
  }

  onLogoError(event: Event): void {
    this.showBrandText = true;
    (event.target as HTMLElement).style.display = 'none';
  }

  ngOnDestroy(): void {
    this.pollSubscription?.unsubscribe();
  }
}

