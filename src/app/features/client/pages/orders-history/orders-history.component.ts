import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { AppBottomNavComponent } from '../../components/app-bottom-nav/app-bottom-nav.component';
import { ChatbotFloatingComponent } from '../../components/chatbot-floating/chatbot-floating.component';
import { ClientDataService } from '../../../../core/services/client-data.service';
import { OrderHistoryItem } from '../../../../core/models/client';

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

  constructor(private clientDataService: ClientDataService) {}

  ngOnInit(): void {
    this.clientDataService.getOrderHistory().subscribe(history => {
      this.orders = history;
    });
  }

  loadFullHistory(): void {
    // Frontend mock append for history loading
    this.orders.push({
      id: 'oh3',
      restaurantName: 'Chez Loutcha',
      restaurantIconType: 'food',
      dateText: '01 Nov, 12:30',
      status: 'Livrée',
      items: [
        { name: 'Thiéboudienne Rouge', quantity: 2, price: 9000 },
        { name: 'Jus de Bouye', quantity: 2, price: 2400 }
      ],
      deliveryFee: 1000,
      totalPrice: 12400
    });
  }

  formatPrice(price: number): string {
    return price.toLocaleString('fr-FR') + ' CFA';
  }
}
