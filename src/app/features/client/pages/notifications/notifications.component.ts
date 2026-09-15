import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { AppBottomNavComponent } from '../../components/app-bottom-nav/app-bottom-nav.component';
import { ChatbotFloatingComponent } from '../../components/chatbot-floating/chatbot-floating.component';
import { ClientDataService } from '../../../../core/services/client-data.service';
import { NotificationItem } from '../../../../core/models/client';

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
  notifications: NotificationItem[] = [];
  searchQuery: string = '';
  showInvoiceModal: boolean = false;
  activeInvoiceRef: string = 'AY-9482';
  isDownloadingInvoice: boolean = false;
  downloadSuccessMessage: boolean = false;

  constructor(
    private clientDataService: ClientDataService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.clientDataService.getNotifications().subscribe(items => {
      this.notifications = items;
    });

    this.route.queryParams.subscribe(params => {
      if (params['receipt'] || params['showReceipt']) {
        this.activeInvoiceRef = params['receipt'] || 'AY-9482';
        this.showInvoiceModal = true;
      }
    });
  }

  openInvoice(ref?: string): void {
    this.activeInvoiceRef = ref || 'AY-9482';
    this.showInvoiceModal = true;
    this.downloadSuccessMessage = false;
  }

  closeInvoice(): void {
    this.showInvoiceModal = false;
  }

  downloadInvoicePdf(): void {
    this.isDownloadingInvoice = true;
    setTimeout(() => {
      this.isDownloadingInvoice = false;
      this.downloadSuccessMessage = true;

      // Create a dummy blob download for Facture_AY-9482.pdf
      const element = document.createElement('a');
      const file = new Blob([
        `==================================================\n` +
        `            FACTURE & REÇU OFFICIEL AYYOU         \n` +
        `==================================================\n` +
        `N° de commande : #${this.activeInvoiceRef}\n` +
        `Date : ${new Date().toLocaleDateString('fr-FR')}\n` +
        `Établissement : Chez Loutcha (Dakar Plateau)\n` +
        `Moyen de paiement : Wave Sénégal\n` +
        `Transaction ID : #WAVE-89421-SN\n` +
        `--------------------------------------------------\n` +
        `1x Thiéboudienne Rouge Royale       4 500 FCFA\n` +
        `1x Yassa au Poulet Braisé            4 500 FCFA\n` +
        `2x Bissap Royal Menthe Fraîche      1 500 FCFA\n` +
        `Frais de livraison                  1 000 FCFA\n` +
        `--------------------------------------------------\n` +
        `TOTAL RÉGLÉ :                      11 500 FCFA\n` +
        `==================================================\n` +
        `            Merci d'avoir choisi AYYOU !           \n` +
        `==================================================\n`
      ], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `Facture_${this.activeInvoiceRef}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 1200);
  }
}
