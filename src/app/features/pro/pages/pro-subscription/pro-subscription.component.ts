import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PaymentService } from '../../../../core/services/payment.service';
import { SubscriptionStatusResponse, AbonnementPro } from '../../../../core/models/payment';

@Component({
  selector: 'app-pro-subscription',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pro-subscription.component.html',
  styleUrls: ['./pro-subscription.component.scss']
})
export class ProSubscriptionComponent implements OnInit {
  subscriptionStatus: SubscriptionStatusResponse | null = null;
  history: AbonnementPro[] = [];
  loading = true;
  submitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private paymentService: PaymentService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['subscription_success']) {
        this.successMessage = "Félicitations ! Votre paiement d'abonnement a été confirmé. Votre compte AYYOU PRO est désormais actif.";
      }
    });
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = '';

    this.paymentService.getSubscriptionStatus().subscribe({
      next: (statusRes) => {
        this.subscriptionStatus = statusRes;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement statut abonnement', err);
        this.errorMessage = "Impossible de charger le statut de votre abonnement.";
        this.loading = false;
      }
    });

    this.paymentService.getSubscriptionHistory().subscribe({
      next: (histRes) => {
        this.history = histRes;
      },
      error: (err) => {
        console.error('Erreur chargement historique abonnements', err);
      }
    });
  }

  paySubscription(): void {
    this.submitting = true;
    this.errorMessage = '';

    this.paymentService.initiateSubscriptionPayment().subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.redirect_url) {
          window.location.href = res.redirect_url;
        } else {
          this.errorMessage = "Redirection PayTech indisponible.";
        }
      },
      error: (err) => {
        this.submitting = false;
        console.error('Erreur initialisation abonnement', err);
        this.errorMessage = err?.error?.detail || "Échec de l'initialisation du paiement PayTech. Veuillez réessayer.";
      }
    });
  }

  downloadInvoice(factureId?: number): void {
    if (!factureId) return;
    this.paymentService.downloadSubscriptionInvoicePdf(factureId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `facture_pro_${factureId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Erreur téléchargement facture PDF', err);
      }
    });
  }
}
