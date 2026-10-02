import { Component, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { AppBottomNavComponent } from '../../components/app-bottom-nav/app-bottom-nav.component';
import { RestaurantCardComponent } from '../../components/restaurant-card/restaurant-card.component';
import { DishCardComponent } from '../../components/dish-card/dish-card.component';
import { ClientDataService } from '../../../../core/services/client-data.service';
import { CartService } from '../../../../core/services/cart.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Category, Dish, Restaurant, Vendor, SearchResult } from '../../../../core/models/client';
import { VoiceTranscriptionService } from '../../../../core/services/voice-transcription.service';

export type ResultTypeFilter = 'all' | 'dishes' | 'restaurants' | 'vendors';
export type VoiceSearchState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SUCCESS' | 'NO_SPEECH' | 'ERROR';

export interface BannerSlide {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  imageUrl: string;
  categoryQuery: string;
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AppHeaderComponent,
    AppBottomNavComponent,
    RestaurantCardComponent,
    DishCardComponent
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

  showAllCategories: boolean = false;

  toggleShowAllCategories(): void {
    this.showAllCategories = !this.showAllCategories;
  }

  cleanCategoryName(name: string): string {
    if (!name) return '';
    return name.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F1E6}-\u{1F1FF}]/gu, '').trim();
  }

  activeSlideIndex: number = 0;

  bannerSlides: BannerSlide[] = [
    {
      id: 'senegal',
      title: 'Découvrez la cuisine Sénégalaise',
      subtitle: 'Des saveurs authentiques près de chez vous',
      buttonText: 'Explorer',
      imageUrl: 'assets/banners/banner_senegal.jpg',
      categoryQuery: 'Sénégalais'
    },
    {
      id: 'fastfood',
      title: 'Découvrez les meilleurs Fast-Foods',
      subtitle: 'Burgers, tacos & frites croustillantes',
      buttonText: 'Découvrir',
      imageUrl: 'assets/banners/banner_fastfood.jpg',
      categoryQuery: 'Fast-Food'
    },
    {
      id: 'patisserie',
      title: 'Pâtisseries & Brunch Gourmands',
      subtitle: 'Douceurs sucrées et rafraîchissements',
      buttonText: 'Savourer',
      imageUrl: 'assets/banners/banner_patisserie.jpg',
      categoryQuery: 'Pâtisserie'
    }
  ];

  restaurants: Restaurant[] = [];
  dishes: Dish[] = [];
  vendors: Vendor[] = [];

  showBackToTop: boolean = false;

  private authService = inject(AuthService);
  private voiceService = inject(VoiceTranscriptionService);

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
    const activeCatObj = this.categories.find(c => c.id === this.activeCategory);
    const cleanCatName = activeCatObj ? this.cleanCategoryName(activeCatObj.name).toLowerCase() : '';

    this.clientDataService.getDishes({
      categoryId: this.activeCategory !== 'all' ? this.activeCategory : undefined,
      search: this.searchQuery
    }).subscribe((dishes: Dish[]) => {
      this.clientDataService.getSearchResults(this.searchQuery).subscribe((res: SearchResult) => {
        let filteredDishes = dishes;
        let filteredRestaurants = res.restaurants;
        let filteredVendors = res.vendors || [];

        if (this.activeCategory !== 'all' && cleanCatName) {
          filteredDishes = filteredDishes.filter(d =>
            d.categoryId === this.activeCategory ||
            (d.categoryName && d.categoryName.toLowerCase().includes(cleanCatName)) ||
            cleanCatName.includes(d.categoryName?.toLowerCase() || '')
          );

          const matchingEtabIds = new Set(filteredDishes.map(d => d.restaurantId));

          filteredRestaurants = filteredRestaurants.filter(r =>
            matchingEtabIds.has(r.id) ||
            (r.tagline && r.tagline.toLowerCase().includes(cleanCatName)) ||
            (r.description && r.description.toLowerCase().includes(cleanCatName)) ||
            r.name.toLowerCase().includes(cleanCatName)
          );

          filteredVendors = filteredVendors.filter(v =>
            matchingEtabIds.has(v.id) ||
            (v.specialty && v.specialty.toLowerCase().includes(cleanCatName)) ||
            v.name.toLowerCase().includes(cleanCatName)
          );
        }

        this.dishes = filteredDishes;
        this.restaurants = filteredRestaurants;
        this.vendors = filteredVendors;
      });
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

  clearAllRecentSearches(): void {
    this.recentSearches = [];
  }

  onBannerScroll(event: Event): void {
    const target = event.target as HTMLElement;
    if (target && target.clientWidth > 0) {
      this.activeSlideIndex = Math.round(target.scrollLeft / target.clientWidth);
    }
  }

  selectSlide(index: number, scrollContainer: HTMLElement): void {
    this.activeSlideIndex = index;
    if (scrollContainer) {
      scrollContainer.scrollTo({
        left: index * scrollContainer.clientWidth,
        behavior: 'smooth'
      });
    }
  }

  onExploreSlide(slide: BannerSlide): void {
    const cat = this.categories.find(c =>
      c.name.toLowerCase().includes(slide.categoryQuery.toLowerCase()) ||
      slide.categoryQuery.toLowerCase().includes(c.name.toLowerCase())
    );
    if (cat) {
      this.selectCategory(cat.id);
    } else {
      this.searchQuery = slide.categoryQuery;
      this.performSearch();
    }
  }

  get inputPlaceholder(): string {
    if (this.voiceState === 'LISTENING') {
      return 'Écoute en cours... Parlez';
    }
    if (this.voiceState === 'PROCESSING') {
      return 'Analyse IA en cours...';
    }

    return 'Plat, restaurant, burger, artisan...';
  }

  voiceState: VoiceSearchState = 'IDLE';
  micTranscript: string = '';
  micErrorMessage: string = '';

  onMicClick(): void {
    if (this.voiceState === 'LISTENING') {
      this.stopAndTranscribe();
    } else if (this.voiceState === 'PROCESSING') {
      // Intentionally ignore click while processing AI transcription
    } else {
      this.triggerMicSearch();
    }
  }

  async triggerMicSearch(): Promise<void> {
    this.micTranscript = '';
    this.micErrorMessage = '';

    const hasPermission = await this.voiceService.requestMicrophonePermission();
    if (!hasPermission) {
      this.voiceState = 'ERROR';
      this.micErrorMessage = 'Accès au microphone refusé. Veuillez l’autoriser dans votre navigateur.';
      setTimeout(() => { this.voiceState = 'IDLE'; }, 3000);
      return;
    }

    const started = await this.voiceService.startRecording();
    if (!started) {
      this.voiceState = 'ERROR';
      this.micErrorMessage = 'Impossible de démarrer l’enregistrement audio.';
      setTimeout(() => { this.voiceState = 'IDLE'; }, 3000);
      return;
    }

    this.voiceState = 'LISTENING';
  }

  async stopAndTranscribe(): Promise<void> {
    if (this.voiceState !== 'LISTENING') return;

    this.voiceState = 'PROCESSING';

    const { blob, durationMs } = await this.voiceService.stopRecording();

    if (!blob || blob.size === 0 || durationMs < 300) {
      this.voiceState = 'IDLE';
      return;
    }

    this.voiceService.transcribeAudio(blob).subscribe({
      next: (res: any) => {
        const queryToUse = res.search_query || res.text || res.transcription;
        if ((res.success || res.status === 'success' || queryToUse) && queryToUse) {
          this.micTranscript = queryToUse;
          this.searchQuery = queryToUse;
          this.performSearch();
        }
        this.voiceState = 'IDLE';
      },
      error: (err: any) => {
        this.voiceState = 'ERROR';
        this.micErrorMessage = 'Le serveur de transcription est indisponible.';
        setTimeout(() => { this.voiceState = 'IDLE'; }, 3000);
      }
    });
  }

  onAddDishToCart(dish: Dish): void {
    if (!this.authService.requireAuth({
      title: 'Connectez-vous pour continuer',
      message: 'Vous devez avoir un compte AYYOU pour ajouter des produits à votre panier.',
      actionType: 'cart',
      returnUrl: '/cart'
    })) {
      return;
    }

    this.cartService.addToCart(dish).subscribe({
      next: () => {
        this.router.navigate(['/cart']);
      },
      error: (err) => {
        const msg = JSON.stringify(err || '').toLowerCase();
        if (msg.includes('variante') || msg.includes('option')) {
          this.router.navigate(['/product', dish.id]);
        } else {
          this.router.navigate(['/cart']);
        }
      }
    });
  }

  get totalResultsCount(): number {
    return this.restaurants.length + this.dishes.length + this.vendors.length;
  }
}
