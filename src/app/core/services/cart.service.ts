import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError, forkJoin } from 'rxjs';
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
  private readonly STORAGE_KEY = 'ayyou_cart_items';

  private itemsSubject: BehaviorSubject<CartItem[]>;
  items$: Observable<CartItem[]>;

  private serverSubtotalSubject = new BehaviorSubject<number>(0);
  serverSubtotal$: Observable<number> = this.serverSubtotalSubject.asObservable();

  private serverDeliveryFeeSubject = new BehaviorSubject<number>(this.DEFAULT_DELIVERY_FEE);
  serverDeliveryFee$: Observable<number> = this.serverDeliveryFeeSubject.asObservable();

  constructor(private http: HttpClient) {
    this.itemsSubject = new BehaviorSubject<CartItem[]>(this.loadLocalCart());
    this.items$ = this.itemsSubject.asObservable();
    this.loadCart().subscribe();
  }

  get items(): CartItem[] {
    return this.itemsSubject.value;
  }

  private loadLocalCart(): CartItem[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('Erreur chargement panier local', e);
    }
    return [];
  }

  private saveLocalCart(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.itemsSubject.value));
      }
    } catch (e) {
      console.warn('Erreur sauvegarde panier local', e);
    }
  }

  /**
   * Charge le panier depuis le backend REST Django.
   */
  loadCart(): Observable<BackendCart | null> {
    return this.http.get<BackendCart>(`${this.baseUrl}/`).pipe(
      tap((cart: BackendCart) => {
        if (cart && Array.isArray(cart.items) && cart.items.length > 0) {
          const mappedItems = cart.items.map(item => this.mapBackendItemToCartItem(item));
          this.itemsSubject.next(mappedItems);
          const subtotal = parseFloat(cart.total_panier || '0');
          this.serverSubtotalSubject.next(subtotal);
          this.saveLocalCart();
        } else if (this.itemsSubject.value.length > 0) {
          // Si le serveur renvoie 0 article mais qu'on a des articles locaux, on conserve le panier local
          this.saveLocalCart();
        } else {
          this.itemsSubject.next([]);
          this.serverSubtotalSubject.next(0);
          this.saveLocalCart();
        }
      }),
      catchError(() => {
        return of(null);
      })
    );
  }

  /**
   * Garantit que le panier en base de données Django contient les articles affichés à l'écran.
   * Si le panier serveur est vide mais que des articles locaux existent, les synchronise vers la BDD.
   */
  ensureServerCartSynced(): Observable<any> {
    return this.loadCart().pipe(
      switchMap(cart => {
        const serverItems = cart?.items || [];
        const localItems = this.getSelectedItems();

        if (serverItems.length > 0) {
          return of(cart);
        }

        if (localItems.length > 0) {
          const addRequests = localItems.map(item => {
            const rawId = item.dish.id;
            const cleanId = String(rawId).replace(/^[a-zA-Z_]+/, '');
            const numericId = parseInt(cleanId, 10);
            const validId = !isNaN(numericId) && numericId > 0 ? numericId : rawId;

            const payload: any = {
              produit: validId,
              quantite: item.quantity
            };
            if (item.varianteId) payload.variante = item.varianteId;
            if (item.optionIds && item.optionIds.length > 0) payload.options = item.optionIds;

            return this.http.post<any>(`${this.baseUrl}/items/`, payload).pipe(
              catchError(() => of(null))
            );
          });

          return forkJoin(addRequests).pipe(
            switchMap(() => this.loadCart())
          );
        }

        return of(cart);
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
    const rawId = dish.id;
    const cleanId = String(rawId).replace(/^[a-zA-Z_]+/, '');
    const numericId = parseInt(cleanId, 10);
    const validId = !isNaN(numericId) && numericId > 0 ? numericId : rawId;

    const payload: any = {
      produit: validId,
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
        if (err.status === 400) {
          const detailStr = JSON.stringify(errorData).toLowerCase();
          if (
            errorData?.code === 'CART_DIFFERENT_ESTABLISHMENT' ||
            detailStr.includes('établissement') ||
            detailStr.includes('variante') ||
            detailStr.includes('disponible') ||
            detailStr.includes('fermé') ||
            detailStr.includes('abonnement')
          ) {
            return throwError(() => errorData);
          }
        }
        this.localAddToCart(dish, quantity);
        return of({ localFallback: true });
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
        this.saveLocalCart();
      }),
      catchError(() => {
        this.itemsSubject.next([]);
        this.serverSubtotalSubject.next(0);
        this.saveLocalCart();
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
      this.saveLocalCart();
    }
  }

  selectAll(selected: boolean): void {
    const current = this.itemsSubject.value.map(item => ({
      ...item,
      selected
    }));
    this.itemsSubject.next(current);
    this.saveLocalCart();
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
      selected: true
    };
  }

  private localAddToCart(dish: Dish, quantity: number = 1): void {
    const current = [...this.itemsSubject.value];
    const index = current.findIndex(item => item.dish.id === dish.id);
    if (index > -1) {
      current[index] = {
        ...current[index],
        quantity: current[index].quantity + quantity,
        selected: true
      };
    } else {
      current.push({ dish, quantity, selected: true });
    }
    this.itemsSubject.next(current);
    this.saveLocalCart();
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
      this.saveLocalCart();
    }
  }

  private localRemoveFromCart(itemIdOrDishId: string | number): void {
    const current = this.itemsSubject.value.filter(
      i => i.id !== itemIdOrDishId && i.dish.id !== itemIdOrDishId
    );
    this.itemsSubject.next(current);
    this.saveLocalCart();
  }
}
