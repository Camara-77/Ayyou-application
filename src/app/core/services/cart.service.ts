import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CartItem, Dish } from '../models/client';
import { BackendCart, BackendCartItem } from '../models/orders';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly baseUrl = `${environment.apiUrl}/api/orders/cart`;
  private readonly DEFAULT_DELIVERY_FEE = 1000; // FCFA

  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  items$: Observable<CartItem[]> = this.itemsSubject.asObservable();

  private serverSubtotalSubject = new BehaviorSubject<number>(0);
  serverSubtotal$: Observable<number> = this.serverSubtotalSubject.asObservable();

  private serverDeliveryFeeSubject = new BehaviorSubject<number>(this.DEFAULT_DELIVERY_FEE);
  serverDeliveryFee$: Observable<number> = this.serverDeliveryFeeSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCart().subscribe();
  }

  get items(): CartItem[] {
    return this.itemsSubject.value;
  }

  /**
   * Charge le panier depuis le backend REST Django.
   */
  loadCart(): Observable<BackendCart | null> {
    return this.http.get<BackendCart>(`${this.baseUrl}/`).pipe(
      tap((cart: BackendCart) => {
        if (cart && Array.isArray(cart.items)) {
          const mappedItems = cart.items.map(item => this.mapBackendItemToCartItem(item));
          this.itemsSubject.next(mappedItems);
          const subtotal = parseFloat(cart.total_panier || '0');
          this.serverSubtotalSubject.next(subtotal);
        }
      }),
      catchError(() => {
        return of(null);
      })
    );
  }

  /**
   * Calcule dynamiquement les frais de livraison par géolocalisation GPS
   */
  estimateDeliveryFee(establishmentId: string | number, lat?: number | null, lng?: number | null): Observable<number> {
    const payload = {
      etablissement_id: establishmentId,
      latitude: lat,
      longitude: lng
    };
    return this.http.post<any>(`${environment.apiUrl}/api/orders/estimate-delivery/`, payload).pipe(
      map(res => {
        const fee = typeof res?.frais_livraison_client === 'number' ? res.frais_livraison_client : 1300;
        this.serverDeliveryFeeSubject.next(fee);
        return fee;
      }),
      catchError(() => {
        this.serverDeliveryFeeSubject.next(1300);
        return of(1300);
      })
    );
  }

  /**
   * Ajoute un produit au panier via POST /api/orders/cart/items/
   */
  addToCart(
    dish: Dish,
    quantity: number = 1,
    varianteId?: string | number,
    optionIds?: (string | number)[]
  ): Observable<any> {
    const payload: any = {
      produit: dish.id,
      quantite: quantity
    };
    if (varianteId) {
      payload.variante = varianteId;
    }
    if (optionIds && optionIds.length > 0) {
      payload.options = optionIds;
    }

    return this.http.post<any>(`${this.baseUrl}/items/`, payload).pipe(
      switchMap(() => this.loadCart()),
      catchError(err => {
        const errorData = err.error || err;
        if (err.status === 400 && (errorData?.code === 'CART_DIFFERENT_ESTABLISHMENT' || (errorData?.detail && String(errorData.detail).includes('autre établissement')))) {
          return throwError(() => errorData);
        }
        return throwError(() => errorData);
      })
    );
  }

  /**
   * Met à jour la quantité via PATCH /api/orders/cart/items/{id}/
   */
  updateQuantity(itemIdOrDishId: string | number, quantity: number): Observable<any> {
    if (quantity <= 0) {
      return this.removeFromCart(itemIdOrDishId);
    }

    const item = this.findCartItem(itemIdOrDishId);
    if (item && item.id) {
      return this.http.patch<any>(`${this.baseUrl}/items/${item.id}/`, { quantite: quantity }).pipe(
        tap(() => this.loadCart().subscribe()),
        catchError(() => {
          this.localUpdateQuantity(itemIdOrDishId, quantity);
          return of(null);
        })
      );
    } else {
      this.localUpdateQuantity(itemIdOrDishId, quantity);
      return of(null);
    }
  }

  /**
   * Supprime un article du panier via DELETE /api/orders/cart/items/{id}/
   */
  removeFromCart(itemIdOrDishId: string | number): Observable<any> {
    const item = this.findCartItem(itemIdOrDishId);
    if (item && item.id) {
      return this.http.delete<any>(`${this.baseUrl}/items/${item.id}/`).pipe(
        tap(() => this.loadCart().subscribe()),
        catchError(() => {
          this.localRemoveFromCart(itemIdOrDishId);
          return of(null);
        })
      );
    } else {
      this.localRemoveFromCart(itemIdOrDishId);
      return of(null);
    }
  }

  /**
   * Vide entièrement le panier actif via DELETE /api/orders/cart/
   */
  clearCart(): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/`).pipe(
      tap(() => {
        this.itemsSubject.next([]);
        this.serverSubtotalSubject.next(0);
      }),
      catchError(() => {
        this.itemsSubject.next([]);
        this.serverSubtotalSubject.next(0);
        return of(null);
      })
    );
  }

  toggleItemSelection(itemIdOrDishId: string | number, selected?: boolean): void {
    const current = [...this.itemsSubject.value];
    const index = current.findIndex(i => i.id === itemIdOrDishId || i.dish.id === itemIdOrDishId);

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
      const selected = this.itemsSubject.value.filter(item => item.selected === true);
      selected.forEach(item => {
        if (item.id) {
          this.removeFromCart(item.id).subscribe();
        } else {
          this.removeFromCart(item.dish.id).subscribe();
        }
      });
    } else {
      this.clearCart().subscribe();
    }
  }

  getSubtotal(): number {
    const selected = this.getSelectedItems();
    if (selected.length === this.itemsSubject.value.length && this.serverSubtotalSubject.value > 0) {
      return this.serverSubtotalSubject.value;
    }
    return selected.reduce((total, item) => total + (item.dish.price * item.quantity), 0);
  }

  getDeliveryFee(): number {
    return this.getSelectedItems().length > 0 ? this.serverDeliveryFeeSubject.value : 0;
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

  private findCartItem(itemIdOrDishId: string | number): CartItem | undefined {
    return this.itemsSubject.value.find(
      i => i.id === itemIdOrDishId || i.dish.id === itemIdOrDishId || String(i.id) === String(itemIdOrDishId)
    );
  }

  private mapBackendItemToCartItem(item: BackendCartItem): CartItem {
    const unitPrice = parseFloat(item.prix_total_unitaire || item.prix_unitaire || '0');
    const subtotal = parseFloat(item.total_ligne || '0');

    const dish: Dish = {
      id: String(item.produit.id || item.produit),
      name: item.produit.nom || 'Produit',
      description: item.produit.description || (item.variante ? item.variante.titre : ''),
      price: unitPrice,
      imageUrl: item.produit.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      restaurantId: item.produit.etablissement_id || 'rest1',
      restaurantName: item.produit.etablissement_nom || 'Chez Loutcha'
    };

    return {
      id: item.id,
      dish,
      quantity: item.quantite,
      unitPrice,
      subtotal,
      varianteId: item.variante?.id,
      varianteName: item.variante?.titre,
      optionIds: (item.options || []).map(o => o.id),
      selected: false
    };
  }

  private localAddToCart(dish: Dish, quantity: number = 1): void {
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

  private localUpdateQuantity(itemIdOrDishId: string | number, quantity: number): void {
    const current = [...this.itemsSubject.value];
    const index = current.findIndex(i => i.id === itemIdOrDishId || i.dish.id === itemIdOrDishId);
    if (index > -1) {
      current[index] = {
        ...current[index],
        quantity
      };
      this.itemsSubject.next(current);
    }
  }

  private localRemoveFromCart(itemIdOrDishId: string | number): void {
    const current = this.itemsSubject.value.filter(
      i => i.id !== itemIdOrDishId && i.dish.id !== itemIdOrDishId
    );
    this.itemsSubject.next(current);
  }
}
