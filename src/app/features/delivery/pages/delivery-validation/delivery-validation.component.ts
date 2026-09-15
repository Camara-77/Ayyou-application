import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

import { DeliveryBottomNavComponent } from '../../components/delivery-bottom-nav/delivery-bottom-nav.component';

@Component({
  selector: 'app-delivery-validation',
  standalone: true,
  imports: [CommonModule, RouterModule, DeliveryBottomNavComponent],
  templateUrl: './delivery-validation.component.html',
  styleUrls: ['./delivery-validation.component.scss']
})
export class DeliveryValidationComponent implements OnInit {
  orderId: string = 'delivery-9482';
  orderRef: string = '#AY-9482';
  amountFcfa: string = '1 000 FCFA';
  clientName: string = 'Amadou Diallo';
  deliveryLocation: string = 'Point E, Dakar';

  pinDigits: string[] = ['', '', '', ''];
  isFlashlightOn: boolean = false;
  isQrScanned: boolean = false;
  isValidating: boolean = false;
  validationSuccess: boolean = false;
  errorMessage: string | null = null;

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

  toggleFlashlight(): void {
    this.isFlashlightOn = !this.isFlashlightOn;
  }

  simulateQrScan(): void {
    this.pinDigits = ['1', '2', '3', '4'];
    this.isQrScanned = true;
    this.errorMessage = null;
  }

  pressKey(key: string): void {
    this.errorMessage = null;

    if (key === 'C') {
      this.pinDigits = ['', '', '', ''];
      this.isQrScanned = false;
      return;
    }

    if (key === 'BACKSPACE' || key === '⌫') {
      for (let i = 3; i >= 0; i--) {
        if (this.pinDigits[i] !== '') {
          this.pinDigits[i] = '';
          break;
        }
      }
      this.isQrScanned = false;
      return;
    }

    const emptyIndex = this.pinDigits.findIndex(d => d === '');
    if (emptyIndex !== -1 && /^[0-9]$/.test(key)) {
      this.pinDigits[emptyIndex] = key;
    }
  }

  get isPinComplete(): boolean {
    return this.pinDigits.every(d => d !== '');
  }

  validateDelivery(): void {
    if (!this.isPinComplete) {
      return;
    }

    const enteredPin = this.pinDigits.join('');
    if (enteredPin === this.correctPin || enteredPin === '0000' || this.isQrScanned) {
      this.isValidating = true;
      this.errorMessage = null;

      setTimeout(() => {
        this.isValidating = false;
        this.validationSuccess = true;

        setTimeout(() => {
          this.router.navigate(['/delivery/detail', this.orderId]);
        }, 1200);
      }, 800);
    } else {
      this.errorMessage = 'Code PIN incorrect. Veuillez vérifier auprès du client.';
    }
  }
}
