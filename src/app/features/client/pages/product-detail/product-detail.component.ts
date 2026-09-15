import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientDataService } from '../../../../core/services/client-data.service';
import { CartService } from '../../../../core/services/cart.service';
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
  selectedVariantId: string = 'v1';
  selectedSauceId: string = 's1';
  selectedSupplementIds: string[] = [];
  specialInstructions: string = '';
  quantity: number = 1;

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

  addToCartAndCheckout(): void {
    if (!this.product) return;

    const dishToCart: Dish = {
      id: this.product.id,
      name: this.product.name,
      description: this.product.description,
      price: this.calculateTotalPrice() / this.quantity,
      imageUrl: this.product.imageUrl,
      restaurantId: this.product.restaurant.id,
      restaurantName: this.product.restaurant.name
    };

    this.cartService.addToCart(dishToCart, this.quantity);
    this.router.navigate(['/checkout']);
  }

  addToCartOnly(): void {
    if (!this.product) return;

    const dishToCart: Dish = {
      id: this.product.id,
      name: this.product.name,
      description: this.product.description,
      price: this.calculateTotalPrice() / this.quantity,
      imageUrl: this.product.imageUrl,
      restaurantId: this.product.restaurant.id,
      restaurantName: this.product.restaurant.name
    };

    this.cartService.addToCart(dishToCart, this.quantity);
    this.router.navigate(['/cart']);
  }
}
