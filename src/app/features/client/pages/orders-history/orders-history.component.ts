import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { AppBottomNavComponent } from '../../components/app-bottom-nav/app-bottom-nav.component';
import { ChatbotFloatingComponent } from '../../components/chatbot-floating/chatbot-floating.component';
import { ClientDataService } from '../../../../core/services/client-data.service';
import { OrderService } from '../../../../core/services/order.service';
import { OrderHistoryItem } from '../../../../core/models/client';
import { CommandeOrder } from '../../../../core/models/orders';
import { AppFooterComponent } from '../../../../shared/components/app-footer/app-footer.component';

@Component({
  selector: 'app-orders-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AppHeaderComponent,
    AppBottomNavComponent,
    ChatbotFloatingComponent,
    AppFooterComponent
  ],
  templateUrl: './orders-history.component.html',
  styleUrls: ['./orders-history.component.scss']
})
export class OrdersHistoryComponent implements OnInit {
  orders: OrderHistoryItem[] = [];
  isLoading = true;

  constructor(
    private clientDataService: ClientDataService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.loadFullHistory();
  }

  loadFullHistory(): void {
    this.isLoading = true;
    this.orderService.getOrders().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const list: CommandeOrder[] = Array.isArray(res) ? res : res?.results || [];
        this.orders = list.map(cmd => this.mapCommandeToHistoryItem(cmd));
      },
      error: () => {
        this.isLoading = false;
        this.orders = [];
      }
    });
  }

  formatPrice(price: number): string {
    return price.toLocaleString('fr-FR') + ' CFA';
  }

  private mapCommandeToHistoryItem(cmd: CommandeOrder): OrderHistoryItem {
    const firstSub = cmd.sous_commandes && cmd.sous_commandes.length > 0 ? cmd.sous_commandes[0] : null;
    const restaurantName = firstSub ? firstSub.etablissement_nom : 'AYYOU Restaurant';

    const dateObj = cmd.date_creation ? new Date(cmd.date_creation) : new Date();
    const dateText = dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) + ', ' +
                     dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    let statusText: 'Livrée' | 'En cours' | 'Annulée' = 'En cours';
    if (cmd.statut === 'LIVREE') {
      statusText = 'Livrée';
    } else if (cmd.statut === 'ANNULEE') {
      statusText = 'Annulée';
    }

    const itemsSummary: Array<{ name: string; quantity: number; price: number }> = [];
    (cmd.sous_commandes || []).forEach(sub => {
      (sub.lignes || []).forEach(line => {
        itemsSummary.push({
          name: line.nom_produit_snapshot,
          quantity: line.quantite,
          price: parseFloat(line.prix_unitaire || '0')
        });
      });
    });

    return {
      id: String(cmd.id),
      restaurantName,
      restaurantIconType: 'food',
      dateText,
      status: statusText,
      items: itemsSummary.length > 0 ? itemsSummary : [{ name: 'Commande AYYOU', quantity: 1, price: parseFloat(cmd.total) }],
      deliveryFee: parseFloat(cmd.frais_livraison || '1000'),
      totalPrice: parseFloat(cmd.total || '0'),
      paymentMethod: 'Paiement AYYOU'
    };
  }
}
