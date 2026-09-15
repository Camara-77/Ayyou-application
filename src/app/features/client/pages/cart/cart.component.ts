import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { AppBottomNavComponent } from '../../components/app-bottom-nav/app-bottom-nav.component';
import { ChatbotFloatingComponent } from '../../components/chatbot-floating/chatbot-floating.component';
import { QuantitySelectorComponent } from '../../components/quantity-selector/quantity-selector.component';
import { CartService } from '../../../../core/services/cart.service';
import { ClientDataService } from '../../../../core/services/client-data.service';
import { CartItem, Dish } from '../../../../core/models/client';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    AppHeaderComponent,
    AppBottomNavComponent,
    ChatbotFloatingComponent,
    QuantitySelectorComponent
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  recommendations: Dish[] = [];
  searchQuery: string = '';
  private sub?: Subscription;

  constructor(
    public cartService: CartService,
    private clientDataService: ClientDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sub = this.cartService.items$.subscribe(items => {
      this.cartItems = items;
    });

    this.clientDataService.getRecommendations().subscribe(dishes => {
      this.recommendations = dishes;
    });
  }

  updateQuantity(dishId: string, newQty: number): void {
    this.cartService.updateQuantity(dishId, newQty);
  }

  removeItem(dishId: string): void {
    this.cartService.removeFromCart(dishId);
  }

  addRecommendation(dish: Dish): void {
    this.cartService.addToCart(dish, 1);
  }

  toggleItemSelection(dishId: string): void {
    this.cartService.toggleItemSelection(dishId);
  }

  toggleSelectAll(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.cartService.selectAll(checkbox.checked);
  }

  isAllSelected(): boolean {
    return this.cartItems.length > 0 && this.cartItems.every(item => item.selected === true);
  }

  hasExplicitSelection(): boolean {
    return this.cartService.hasExplicitSelection();
  }

  getSelectedCount(): number {
    return this.cartService.getSelectedCount();
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  formatPrice(price: number): string {
    return price.toLocaleString('fr-FR') + ' FCFA';
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
