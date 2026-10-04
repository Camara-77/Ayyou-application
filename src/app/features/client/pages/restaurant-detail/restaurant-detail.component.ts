import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { AppBottomNavComponent } from '../../components/app-bottom-nav/app-bottom-nav.component';
import { DishCardComponent } from '../../components/dish-card/dish-card.component';
import { ClientDataService } from '../../../../core/services/client-data.service';
import { CartService } from '../../../../core/services/cart.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Category, Dish, FeedItem, Restaurant } from '../../../../core/models/client';

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AppHeaderComponent,
    AppBottomNavComponent,
    DishCardComponent
  ],
  templateUrl: './restaurant-detail.component.html',
  styleUrls: ['./restaurant-detail.component.scss']
})
export class RestaurantDetailComponent implements OnInit {
  restaurant?: Restaurant;
  restaurantVideos: FeedItem[] = [];
  activeTab: 'menu' | 'videos' = 'menu';
  selectedCategoryId: string = 'all';

  private authService = inject(AuthService);
  private router = inject(Router);

  constructor(
    private route: ActivatedRoute,
    private clientDataService: ClientDataService,
    private cartService: CartService
  ) {}

  isSubscribing: boolean = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '69';
    this.clientDataService.getRestaurant(id).subscribe(res => {
      this.restaurant = res;
    });
    this.clientDataService.getFeedForRestaurant(id).subscribe(vids => {
      this.restaurantVideos = vids;
    });
  }

  toggleSubscription(): void {
    if (!this.restaurant) return;

    if (!this.authService.requireAuth({
      title: 'Connectez-vous pour vous abonner',
      message: 'Vous devez avoir un compte AYYOU pour vous abonner à un établissement.',
      actionType: 'generic'
    })) {
      return;
    }

    if (this.isSubscribing) return;
    this.isSubscribing = true;

    const etabId = this.restaurant.id;
    const currentlySubscribed = !!this.restaurant.isSubscribed;

    if (currentlySubscribed) {
      this.restaurant.isSubscribed = false;
      if (this.restaurant.followersCount && this.restaurant.followersCount > 0) {
        this.restaurant.followersCount--;
      }
      this.clientDataService.unsubscribeFromEstablishment(etabId).subscribe({
        next: () => {
          this.isSubscribing = false;
        },
        error: () => {
          if (this.restaurant) {
            this.restaurant.isSubscribed = true;
            this.restaurant.followersCount = (this.restaurant.followersCount || 0) + 1;
          }
          this.isSubscribing = false;
        }
      });
    } else {
      this.restaurant.isSubscribed = true;
      this.restaurant.followersCount = (this.restaurant.followersCount || 0) + 1;
      this.clientDataService.subscribeToEstablishment(etabId).subscribe({
        next: () => {
          this.isSubscribing = false;
        },
        error: () => {
          if (this.restaurant) {
            this.restaurant.isSubscribed = false;
            if (this.restaurant.followersCount && this.restaurant.followersCount > 0) {
              this.restaurant.followersCount--;
            }
          }
          this.isSubscribing = false;
        }
      });
    }
  }

  selectCategory(catId: string): void {
    this.selectedCategoryId = catId;
  }

  openVideo(item: FeedItem): void {
    if (item?.id) {
      this.router.navigate(['/feed/video', item.id]);
    }
  }

  get filteredDishes(): Dish[] {
    if (!this.restaurant) return [];
    if (this.selectedCategoryId === 'all') return this.restaurant.dishes;
    return this.restaurant.dishes.filter(d => d.categoryId === this.selectedCategoryId);
  }

  showCartConflictModal: boolean = false;
  pendingConflictDish?: Dish;

  addToCart(dish: Dish): void {
    if (!this.authService.requireAuth({
      title: 'Connectez-vous pour continuer',
      message: 'Vous devez avoir un compte AYYOU pour ajouter des produits à votre panier et passer une commande.',
      actionType: 'cart',
      returnUrl: '/cart'
    })) {
      return;
    }

    this.cartService.addToCart(dish, 1).subscribe({
      next: () => {
        this.router.navigate(['/cart']);
      },
      error: (err) => {
        if (err?.code === 'CART_DIFFERENT_ESTABLISHMENT' || (err?.detail && String(err.detail).includes('autre établissement'))) {
          this.pendingConflictDish = dish;
          this.showCartConflictModal = true;
        } else {
          this.router.navigate(['/cart']);
        }
      }
    });
  }

  confirmClearAndAdd(): void {
    if (!this.pendingConflictDish) return;
    const dish = this.pendingConflictDish;

    this.cartService.clearCart().subscribe(() => {
      this.cartService.addToCart(dish, 1).subscribe(() => {
        this.router.navigate(['/cart']);
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
