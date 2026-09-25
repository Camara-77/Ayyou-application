import { Component, OnInit, AfterViewInit, ViewChild, ViewChildren, QueryList, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { AppBottomNavComponent } from '../../components/app-bottom-nav/app-bottom-nav.component';
import { ChatbotFloatingComponent } from '../../components/chatbot-floating/chatbot-floating.component';
import { FoodPostComponent } from '../../components/food-post/food-post.component';
import { ClientDataService } from '../../../../core/services/client-data.service';
import { CartService } from '../../../../core/services/cart.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Dish, FeedItem } from '../../../../core/models/client';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AppHeaderComponent,
    AppBottomNavComponent,
    ChatbotFloatingComponent,
    FoodPostComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  feedItems: FeedItem[] = [];

  @ViewChildren(FoodPostComponent) postComponents!: QueryList<FoodPostComponent>;
  @ViewChild('feedContent') feedContentRef!: ElementRef<HTMLElement>;

  private scrollEndTimer: any = null;
  private authService = inject(AuthService);

  constructor(
    private clientDataService: ClientDataService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.clientDataService.getFeed().subscribe(items => {
      this.feedItems = items;
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.playActiveCenteredVideo();
    }, 300);
  }

  onFeedScroll(): void {
    // 1. Immediately pause all videos while scrolling
    this.pauseAllVideos();

    // 2. Debounce scroll stop to trigger play on the visible video
    if (this.scrollEndTimer !== null) {
      clearTimeout(this.scrollEndTimer);
    }

    this.scrollEndTimer = setTimeout(() => {
      this.scrollEndTimer = null;
      this.playActiveCenteredVideo();
    }, 150);
  }

  private pauseAllVideos(): void {
    if (this.postComponents) {
      this.postComponents.forEach(post => post.pauseVideo());
    }
  }

  private playActiveCenteredVideo(): void {
    if (!this.postComponents || !this.feedContentRef) return;

    const container = this.feedContentRef.nativeElement;
    const containerRect = container.getBoundingClientRect();
    const containerCenterY = containerRect.top + containerRect.height / 2;

    let closestPost: FoodPostComponent | null = null;
    let minDistance = Infinity;

    this.postComponents.forEach((postComp) => {
      const el = postComp.elementRef?.nativeElement;
      if (el) {
        const rect = el.getBoundingClientRect();
        const postCenterY = rect.top + rect.height / 2;
        const distance = Math.abs(containerCenterY - postCenterY);
        if (distance < minDistance) {
          minDistance = distance;
          closestPost = postComp;
        }
      }
    });

    if (closestPost && minDistance < containerRect.height * 0.35) {
      (closestPost as FoodPostComponent).playVideo();
    }
  }

  onOrderDish(dish: Dish): void {
    if (!this.authService.requireAuth({
      title: 'Connectez-vous pour continuer',
      message: 'Vous devez avoir un compte AYYOU pour ajouter un produit et passer commande.',
      actionType: 'order',
      returnUrl: '/checkout'
    })) {
      return;
    }

    this.cartService.addToCart(dish, 1).subscribe({
      next: () => {
        this.router.navigate(['/checkout']);
      },
      error: () => {
        this.router.navigate(['/cart']);
      }
    });
  }

  onQuickCart(dish: Dish): void {
    if (!this.authService.requireAuth({
      title: 'Connectez-vous pour continuer',
      message: 'Vous devez avoir un compte AYYOU pour ajouter des produits à votre panier.',
      actionType: 'cart',
      returnUrl: '/cart'
    })) {
      return;
    }

    this.cartService.addToCart(dish, 1).subscribe({
      next: () => {
        this.router.navigate(['/cart']);
      },
      error: () => {}
    });
  }
}
