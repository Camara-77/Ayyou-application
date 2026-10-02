import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PaymentService } from '../../../../core/services/payment.service';
import { SubscriptionStatusResponse } from '../../../../core/models/payment';

@Component({
  selector: 'app-pro-subscription-banner',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pro-subscription-banner.component.html',
  styleUrls: ['./pro-subscription-banner.component.scss']
})
export class ProSubscriptionBannerComponent implements OnInit {
  private paymentService = inject(PaymentService);

  subscriptionStatus: SubscriptionStatusResponse | null = null;
  isExpired: boolean = false;
  submitting: boolean = false;
  errorMessage: string = '';

  ngOnInit(): void {
    this.checkSubscriptionStatus();
  }

  checkSubscriptionStatus(): void {
    this.paymentService.getSubscriptionStatus().subscribe({
      next: (res) => {
        this.subscriptionStatus = res;
        this.isExpired = !res.est_actif || res.statut_abonnement === 'EXPIRE' || res.statut_abonnement === 'INACTIF';
      },
      error: () => {
        this.isExpired = false;
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
          this.errorMessage = "Impossible de rediriger vers le guichet de paiement PayTech.";
        }
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err?.error?.detail || "Erreur d'initialisation du paiement PayTech. Veuillez réessayer.";
      }
    });
  }
}
