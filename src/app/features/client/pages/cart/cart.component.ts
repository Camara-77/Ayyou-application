import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { AppBottomNavComponent } from '../../components/app-bottom-nav/app-bottom-nav.component';
import { QuantitySelectorComponent } from '../../components/quantity-selector/quantity-selector.component';
import { CartService } from '../../../../core/services/cart.service';
import { CartItem } from '../../../../core/models/client';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    AppHeaderComponent,
    AppBottomNavComponent,
    QuantitySelectorComponent
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  searchQuery: string = '';
  private sub?: Subscription;

  constructor(
    public cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sub = this.cartService.items$.subscribe(items => {
      this.cartItems = items;
    });
  }

  updateQuantity(dishId: string, newQty: number): void {
    this.cartService.updateQuantity(dishId, newQty);
  }

  removeItem(dishId: string): void {
    this.cartService.removeFromCart(dishId);
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

  getShortDescription(desc: string | undefined): string {
    if (!desc) return '';
    const sentences = desc.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return '';
    if (sentences.length === 1) return sentences[0];
    const firstTwo = `${sentences[0]} ${sentences[1]}`;
    if (firstTwo.length <= 110) {
      return firstTwo;
    }
    return sentences[0];
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
