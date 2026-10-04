import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { AppBottomNavComponent } from '../../components/app-bottom-nav/app-bottom-nav.component';
import { ClientDataService } from '../../../../core/services/client-data.service';
import { OrderService } from '../../../../core/services/order.service';
import { CommandeOrder } from '../../../../core/models/orders';
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
  qrCodeSvgContent: SafeHtml | null = null;
  clientCode: string = '9482';
  restaurantPhone: string = '+221770000000';

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private clientDataService: ClientDataService,
    private orderService: OrderService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '1';

    this.orderService.getOrderById(id).subscribe({
      next: (cmd: CommandeOrder) => {
        const orderRefShort = cmd.numero_commande
          ? (cmd.numero_commande.split('-').pop() || String(cmd.id))
          : String(cmd.id);
        this.clientCode = orderRefShort.slice(-4);
        const tokenQr = (cmd as any).livraison?.token_qr || `AYYOU-DELIVERY-${id}`;
        const svgString = generateQrCodeSvg(tokenQr, 220);
        this.qrCodeSvgContent = this.sanitizer.bypassSecurityTrustHtml(svgString);
      },
      error: () => {
        this.clientDataService.getOrderValidation(id).subscribe(data => {
          if (data && data.clientCode) {
            this.clientCode = data.clientCode.replace(/[^0-9]/g, '') || '9482';
          }
          const svgString = generateQrCodeSvg(data?.tokenQr || `AYYOU-DELIVERY-${id}`, 220);
          this.qrCodeSvgContent = this.sanitizer.bypassSecurityTrustHtml(svgString);
        });
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}
