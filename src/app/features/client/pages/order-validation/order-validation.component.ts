import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { AppBottomNavComponent } from '../../components/app-bottom-nav/app-bottom-nav.component';
import { ClientDataService } from '../../../../core/services/client-data.service';
import { OrderValidationData } from '../../../../core/models/client';
import { generateQrCodeSvg } from '../../../../core/utils/qr-code.util';

@Component({
  selector: 'app-order-validation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AppHeaderComponent,
    AppBottomNavComponent
  ],
  templateUrl: './order-validation.component.html',
  styleUrls: ['./order-validation.component.scss']
})
export class OrderValidationComponent implements OnInit {
  validationData: OrderValidationData | null = null;
  qrCodeSvgContent: SafeHtml | null = null;

  constructor(
    private route: ActivatedRoute,
    private clientDataService: ClientDataService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '1';
    this.clientDataService.getOrderValidation(id).subscribe(data => {
      this.validationData = data;
      if (data && data.tokenQr) {
        const svgString = generateQrCodeSvg(data.tokenQr, 220);
        this.qrCodeSvgContent = this.sanitizer.bypassSecurityTrustHtml(svgString);
      } else {
        const svgString = generateQrCodeSvg(`AYYOU-DELIVERY-${id}`, 220);
        this.qrCodeSvgContent = this.sanitizer.bypassSecurityTrustHtml(svgString);
      }
    });
  }

  formatPrice(amount: number): string {
    return amount.toLocaleString('fr-FR') + ' F';
  }

  callRestaurant(): void {
    if (this.validationData?.restaurant.phone) {
      window.location.href = `tel:${this.validationData.restaurant.phone}`;
    }
  }

  openGpsRoute(): void {
    const addr = this.validationData?.restaurant.address || 'Dakar, Sénégal';
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
    window.open(url, '_blank');
  }
}

