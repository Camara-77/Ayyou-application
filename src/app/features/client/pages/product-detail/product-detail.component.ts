import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientDataService } from '../../../../core/services/client-data.service';
import { CartService } from '../../../../core/services/cart.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ProductDetail, Dish } from '../../../../core/models/client';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  product: ProductDetail | null = null;
  selectedVariantId: string = '';
  selectedSauceId: string = '';
  selectedSupplementIds: string[] = [];
  specialInstructions: string = '';
  quantity: number = 1;

  private authService = inject(AuthService);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientDataService: ClientDataService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || 'd1';
    this.clientDataService.getProductDetail(id).subscribe(data => {
      this.product = data;
      if (data.variants && data.variants.length > 0) {
        this.selectedVariantId = data.variants[0].id;
      }
      if (data.sauces && data.sauces.length > 0) {
        this.selectedSauceId = data.sauces[0].id;
      }
    });
  }

  selectVariant(id: string): void {
    this.selectedVariantId = id;
  }

  selectSauce(id: string): void {
    this.selectedSauceId = id;
  }

  toggleSupplement(id: string): void {
    const idx = this.selectedSupplementIds.indexOf(id);
    if (idx > -1) {
      this.selectedSupplementIds.splice(idx, 1);
    } else {
      this.selectedSupplementIds.push(id);
    }
  }

  isSupplementSelected(id: string): boolean {
    return this.selectedSupplementIds.includes(id);
  }

  calculateTotalPrice(): number {
    if (!this.product) return 0;
    let total = this.product.price;

    const variant = this.product.variants.find(v => v.id === this.selectedVariantId);
    if (variant) {
      total += variant.priceOffset;
    }

    const sauce = this.product.sauces.find(s => s.id === this.selectedSauceId);
    if (sauce) {
      total += sauce.priceOffset;
    }

    this.selectedSupplementIds.forEach(supId => {
      const sup = this.product?.supplements.find(s => s.id === supId);
      if (sup) {
        total += sup.priceOffset;
      }
    });

    return total * this.quantity;
  }

  formatPrice(amount: number): string {
    return amount.toLocaleString('fr-FR') + ' FCFA';
  }

  formatOffset(offset: number): string {
    if (offset === 0) return '+0 FCFA';
    return '+' + offset.toLocaleString('fr-FR') + ' FCFA';
  }

  showCartConflictModal: boolean = false;
  pendingConflictDish?: Dish;
  pendingConflictQuantity: number = 1;
  pendingConflictVariantId?: string;
  pendingConflictOptionIds: string[] = [];
  pendingCheckoutAfterAdd: boolean = false;

  addToCartAndCheckout(): void {
    this.executeAddToCart(true);
  }

  addToCartOnly(): void {
    this.executeAddToCart(false);
  }

  private executeAddToCart(andCheckout: boolean): void {
    if (!this.product) return;

    if (!this.authService.requireAuth({
      title: 'Connectez-vous pour continuer',
      message: 'Vous devez avoir un compte AYYOU pour ajouter des produits à votre panier et passer une commande.',
      actionType: andCheckout ? 'order' : 'cart',
      returnUrl: this.router.url
    })) {
      return;
    }

    const dishToCart: Dish = {
      id: this.product.id,
      name: this.product.name,
      description: this.product.description,
      price: this.calculateTotalPrice() / this.quantity,
      imageUrl: this.product.imageUrl,
      restaurantId: this.product.restaurant.id,
      restaurantName: this.product.restaurant.name
    };

    const validVariantId = (this.selectedVariantId && !isNaN(Number(this.selectedVariantId)))
      ? this.selectedVariantId
      : undefined;

    const optionIds: (string | number)[] = [
      ...(this.selectedSauceId && !isNaN(Number(this.selectedSauceId)) ? [this.selectedSauceId] : []),
      ...this.selectedSupplementIds.filter(id => !isNaN(Number(id)))
    ];

    this.cartService.addToCart(dishToCart, this.quantity, validVariantId, optionIds).subscribe({
      next: () => {
        this.router.navigate([andCheckout ? '/checkout' : '/cart']);
      },
      error: (err) => {
        if (err?.code === 'CART_DIFFERENT_ESTABLISHMENT' || (err?.detail && String(err.detail).includes('autre établissement'))) {
          this.pendingConflictDish = dishToCart;
          this.pendingConflictQuantity = this.quantity;
          this.pendingConflictVariantId = validVariantId;
          this.pendingConflictOptionIds = optionIds.map(o => String(o));
          this.pendingCheckoutAfterAdd = andCheckout;
          this.showCartConflictModal = true;
        } else {
          // Naviguer quand même si ajout local ou secours nécessaire
          this.router.navigate([andCheckout ? '/checkout' : '/cart']);
        }
      }
    });
  }

  confirmClearAndAdd(): void {
    if (!this.pendingConflictDish) return;
    const dish = this.pendingConflictDish;
    const qty = this.pendingConflictQuantity;
    const variante = this.pendingConflictVariantId;
    const options = this.pendingConflictOptionIds;
    const andCheckout = this.pendingCheckoutAfterAdd;

    this.cartService.clearCart().subscribe(() => {
      this.cartService.addToCart(dish, qty, variante, options).subscribe(() => {
        this.router.navigate([andCheckout ? '/checkout' : '/cart']);
      });
      this.showCartConflictModal = false;
      this.pendingConflictDish = undefined;
    });
  }

  cancelConflictModal(): void {
    this.showCartConflictModal = false;
    this.pendingConflictDish = undefined;
  }
}
