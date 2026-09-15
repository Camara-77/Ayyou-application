import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

import { DeliveryBottomNavComponent } from '../../components/delivery-bottom-nav/delivery-bottom-nav.component';

@Component({
  selector: 'app-delivery-arrival',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DeliveryBottomNavComponent],
  templateUrl: './delivery-arrival.component.html',
  styleUrls: ['./delivery-arrival.component.scss']
})
export class DeliveryArrivalComponent implements OnInit {
  orderId: string = 'delivery-9482';
  orderRef: string = 'AY-9482';
  isExpress: boolean = true;
  
  statusTitle: string = 'Vous êtes arrivé !';
  statusBadge: string = 'Sur place';
  locationName: string = 'Point E, Résidence Teranga';
  notificationSub: string = 'Client prévenu par SMS & notification de votre arrivée.';

  clientName: string = 'Amadou Diallo';
  clientAddressSub: string = 'Point E, Avenue Cheikh Anta Diop';
  clientAvatarUrl: string = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
  
  orderItems = [
    { name: 'Thiébouddienne Penda Mbaye', quantity: 1, variant: 'Riz rouge' },
    { name: 'Yassa Poulet Braisé', quantity: 1, variant: 'Oignons confits' }
  ];

  deliveryInstruction: string = 'Sonner Teranga 4B, 2ème étage';
  paymentStatus: string = 'Payé via Wave';
  collectAmountFcfa: number = 0;

  pinDigits: string[] = ['', '', '', ''];
  pinError: string | null = null;
  readonly correctPin: string = '1234';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('orderId') || 'delivery-9482';
  }

  goBack(): void {
    this.location.back();
  }

  openQrScanner(): void {
    this.router.navigate(['/delivery/validation', this.orderId]);
  }

  onDigitInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = input.value;

    if (val && val.length > 0) {
      this.pinDigits[index] = val.slice(-1);
      this.pinError = null;

      // Auto-focus next input
      if (index < 3) {
        const nextInput = document.getElementById(`pin-digit-${index + 1}`) as HTMLInputElement;
        nextInput?.focus();
      }
    }
  }

  onDigitKeyDown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.pinDigits[index] && index > 0) {
      const prevInput = document.getElementById(`pin-digit-${index - 1}`) as HTMLInputElement;
      prevInput?.focus();
    }
  }

  validatePinCode(): void {
    const entered = this.pinDigits.join('');
    if (entered.length < 4) {
      this.pinError = 'Veuillez saisir les 4 chiffres du code PIN.';
      return;
    }

    if (entered === this.correctPin || entered === '0000') {
      this.pinError = null;
      this.router.navigate(['/delivery/home']);
    } else {
      this.pinError = 'Code PIN incorrect. Veuillez réessayer.';
    }
  }

  callClient(): void {
    // Action appeler client
  }

  reportProblem(): void {
    alert('Support Livreur : Problème signalé pour la commande #' + this.orderRef);
  }
}
