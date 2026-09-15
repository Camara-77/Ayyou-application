import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { AppBottomNavComponent } from '../../components/app-bottom-nav/app-bottom-nav.component';
import { ChatbotFloatingComponent } from '../../components/chatbot-floating/chatbot-floating.component';
import { FoodPostComponent } from '../../components/food-post/food-post.component';
import { CartService } from '../../../../core/services/cart.service';
import { ClientDataService } from '../../../../core/services/client-data.service';
import { FeedItem, Dish } from '../../../../core/models/client';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AppBottomNavComponent,
    ChatbotFloatingComponent,
    FoodPostComponent
  ],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit {
  favorites: FeedItem[] = [];

  constructor(
    private clientDataService: ClientDataService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.clientDataService.getFavorites().subscribe(items => {
      this.favorites = items;
    });
  }

  onOrderDish(dish: Dish): void {
    this.cartService.addToCart(dish, 1);
    this.router.navigate(['/checkout']);
  }

  onQuickCart(dish: Dish): void {
    this.cartService.addToCart(dish, 1);
    this.router.navigate(['/cart']);
  }
}
