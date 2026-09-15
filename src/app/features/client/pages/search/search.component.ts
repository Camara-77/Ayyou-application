import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { AppBottomNavComponent } from '../../components/app-bottom-nav/app-bottom-nav.component';
import { ChatbotFloatingComponent } from '../../components/chatbot-floating/chatbot-floating.component';
import { RestaurantCardComponent } from '../../components/restaurant-card/restaurant-card.component';
import { DishCardComponent } from '../../components/dish-card/dish-card.component';
import { ClientDataService } from '../../../../core/services/client-data.service';
import { CartService } from '../../../../core/services/cart.service';
import { Category, Dish, Restaurant, Vendor, SearchResult } from '../../../../core/models/client';

export type ResultTypeFilter = 'all' | 'dishes' | 'restaurants' | 'vendors';

import { AppFooterComponent } from '../../../../shared/components/app-footer/app-footer.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AppHeaderComponent,
    AppBottomNavComponent,
    ChatbotFloatingComponent,
    RestaurantCardComponent,
    DishCardComponent,
    AppFooterComponent
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  searchQuery: string = '';
  activeCategory: string = 'all';
  activeResultType: ResultTypeFilter = 'all';

  categories: Category[] = [];
  recentSearches: string[] = ['Burger gourmet', 'Thiéboudienne', 'Pâtisserie & Brunch'];

  restaurants: Restaurant[] = [];
  dishes: Dish[] = [];
  vendors: Vendor[] = [];

  showBackToTop: boolean = false;

  constructor(
    private clientDataService: ClientDataService,
    private cartService: CartService,
    private router: Router
  ) {}

  onVendorClick(vendorId: string | number): void {
    if (vendorId) {
      this.router.navigate(['/restaurant', vendorId]);
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    this.showBackToTop = scrollY > 200;
  }

  scrollToTop(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  ngOnInit(): void {
    this.clientDataService.getCategories().subscribe(cats => {
      this.categories = cats;
    });

    this.performSearch();
  }

  performSearch(): void {
    this.clientDataService.getSearchResults(this.searchQuery).subscribe((res: SearchResult) => {
      let filteredRestaurants = res.restaurants;
      let filteredDishes = res.dishes;
      let filteredVendors = res.vendors || [];

      // Filter by active category if not 'all'
      if (this.activeCategory !== 'all') {
        const catName = this.categories.find(c => c.id === this.activeCategory)?.name.toLowerCase() || '';
        filteredDishes = filteredDishes.filter(d =>
          d.categoryId === this.activeCategory ||
          (d.categoryName && d.categoryName.toLowerCase().includes(catName)) ||
          d.name.toLowerCase().includes(catName)
        );
        filteredRestaurants = filteredRestaurants.filter(r =>
          (r.tagline && r.tagline.toLowerCase().includes(catName)) ||
          r.name.toLowerCase().includes(catName)
        );
      }

      this.restaurants = filteredRestaurants;
      this.dishes = filteredDishes;
      this.vendors = filteredVendors;
    });
  }

  onSearchInput(): void {
    this.performSearch();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.performSearch();
  }

  selectCategory(catId: string): void {
    this.activeCategory = catId;
    this.performSearch();
  }

  setResultType(type: ResultTypeFilter): void {
    this.activeResultType = type;
  }

  selectRecentSearch(term: string): void {
    this.searchQuery = term;
    this.performSearch();
  }

  removeRecentSearch(index: number, event: Event): void {
    event.stopPropagation();
    this.recentSearches.splice(index, 1);
  }

  showMicModal: boolean = false;
  micTranscript: string = '';
  isMicListening: boolean = false;
  private micTimer: any = null;

  triggerMicSearch(): void {
    this.showMicModal = true;
    this.isMicListening = true;
    this.micTranscript = 'Écoute en cours...';

    if (this.micTimer !== null) {
      clearTimeout(this.micTimer);
    }

    // Simulate voice speech recognition response after 1.6 seconds
    this.micTimer = setTimeout(() => {
      this.isMicListening = false;
      this.micTranscript = 'Thiéboudienne Penda Mbaye';
    }, 1600);
  }

  confirmMicSearch(): void {
    if (this.micTranscript && this.micTranscript !== 'Écoute en cours...') {
      this.searchQuery = this.micTranscript;
    } else {
      this.searchQuery = 'Thiéboudienne';
    }
    this.showMicModal = false;
    this.performSearch();
  }

  closeMicModal(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.micTimer !== null) {
      clearTimeout(this.micTimer);
      this.micTimer = null;
    }
    this.showMicModal = false;
    this.isMicListening = false;
  }

  onAddDishToCart(dish: Dish): void {
    this.cartService.addToCart(dish);
  }

  get totalResultsCount(): number {
    return this.restaurants.length + this.dishes.length + this.vendors.length;
  }
}
