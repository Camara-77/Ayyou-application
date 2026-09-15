import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem, Dish } from '../models/client';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly DELIVERY_FEE = 1000; // FCFA

  // Initial cart items matching media_1789251529406.png mockup
  private initialItems: CartItem[] = [
    {
      dish: {
        id: 'd1',
        name: 'Thiéboudienne Rouge',
        description: 'Riz rouge, mérou frais, légumes',
        price: 4500,
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        restaurantId: 'rest1',
        restaurantName: 'Chez Loutcha'
      },
      quantity: 1
    },
    {
      dish: {
        id: 'd2_pastels',
        name: 'Pastels au Poisson (x6)',
        description: 'Accompagnés de sauce tomate épicée',
        price: 4500,
        imageUrl: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80',
        restaurantId: 'rest1',
        restaurantName: 'Chez Loutcha'
      },
      quantity: 1
    }
  ];

  private itemsSubject = new BehaviorSubject<CartItem[]>(this.initialItems);
  items$: Observable<CartItem[]> = this.itemsSubject.asObservable();

  get items(): CartItem[] {
    return this.itemsSubject.value;
  }

  addToCart(dish: Dish, quantity: number = 1): void {
    const current = [...this.itemsSubject.value];
    const index = current.findIndex(item => item.dish.id === dish.id);

    if (index > -1) {
      current[index] = {
        ...current[index],
        quantity: current[index].quantity + quantity
      };
    } else {
      current.push({ dish, quantity });
    }

    this.itemsSubject.next(current);
  }

  updateQuantity(dishId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(dishId);
      return;
    }

    const current = [...this.itemsSubject.value];
    const index = current.findIndex(item => item.dish.id === dishId);

    if (index > -1) {
      current[index] = {
        ...current[index],
        quantity
      };
      this.itemsSubject.next(current);
    }
  }

  removeFromCart(dishId: string): void {
    const current = this.itemsSubject.value.filter(item => item.dish.id !== dishId);
    this.itemsSubject.next(current);
  }

  clearCart(): void {
    this.itemsSubject.next([]);
  }

  toggleItemSelection(dishId: string, selected?: boolean): void {
    const current = [...this.itemsSubject.value];
    const index = current.findIndex(item => item.dish.id === dishId);

    if (index > -1) {
      const isSelected = selected !== undefined ? selected : !current[index].selected;
      current[index] = {
        ...current[index],
        selected: isSelected
      };
      this.itemsSubject.next(current);
    }
  }

  selectAll(selected: boolean): void {
    const current = this.itemsSubject.value.map(item => ({
      ...item,
      selected
    }));
    this.itemsSubject.next(current);
  }

  hasExplicitSelection(): boolean {
    return this.itemsSubject.value.some(item => item.selected === true);
  }

  getSelectedItems(): CartItem[] {
    const selected = this.itemsSubject.value.filter(item => item.selected === true);
    return selected.length > 0 ? selected : this.itemsSubject.value;
  }

  removeSelectedItems(): void {
    if (this.hasExplicitSelection()) {
      const remaining = this.itemsSubject.value.filter(item => !item.selected);
      this.itemsSubject.next(remaining);
    } else {
      this.clearCart();
    }
  }

  getSubtotal(): number {
    return this.getSelectedItems().reduce((total, item) => total + (item.dish.price * item.quantity), 0);
  }

  getDeliveryFee(): number {
    return this.getSelectedItems().length > 0 ? this.DELIVERY_FEE : 0;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getDeliveryFee();
  }

  getItemCount(): number {
    return this.getSelectedItems().reduce((count, item) => count + item.quantity, 0);
  }

  getSelectedCount(): number {
    return this.itemsSubject.value.filter(item => item.selected === true).length;
  }
}
