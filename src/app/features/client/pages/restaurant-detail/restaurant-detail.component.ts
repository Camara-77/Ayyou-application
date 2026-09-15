import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { AppBottomNavComponent } from '../../components/app-bottom-nav/app-bottom-nav.component';
import { ChatbotFloatingComponent } from '../../components/chatbot-floating/chatbot-floating.component';
import { DishCardComponent } from '../../components/dish-card/dish-card.component';
import { ClientDataService } from '../../../../core/services/client-data.service';
import { CartService } from '../../../../core/services/cart.service';
import { Category, Dish, Restaurant } from '../../../../core/models/client';

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AppHeaderComponent,
    AppBottomNavComponent,
    ChatbotFloatingComponent,
    DishCardComponent
  ],
  templateUrl: './restaurant-detail.component.html',
  styleUrls: ['./restaurant-detail.component.scss']
})
export class RestaurantDetailComponent implements OnInit {
  restaurant?: Restaurant;
  activeTab: 'menu' | 'videos' = 'menu';
  selectedCategoryId: string = 'all';

  constructor(
    private route: ActivatedRoute,
    private clientDataService: ClientDataService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || 'rest1';
    this.clientDataService.getRestaurant(id).subscribe(res => {
      this.restaurant = res;
    });
  }

  selectCategory(catId: string): void {
    this.selectedCategoryId = catId;
  }

  get filteredDishes(): Dish[] {
    if (!this.restaurant) return [];
    if (this.selectedCategoryId === 'all') return this.restaurant.dishes;
    return this.restaurant.dishes.filter(d => d.categoryId === this.selectedCategoryId);
  }

  addToCart(dish: Dish): void {
    this.cartService.addToCart(dish, 1);
  }
}
