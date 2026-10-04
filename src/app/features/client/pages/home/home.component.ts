import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ViewChildren, QueryList, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { AppBottomNavComponent } from '../../components/app-bottom-nav/app-bottom-nav.component';
import { FoodPostComponent } from '../../components/food-post/food-post.component';
import { ClientDataService } from '../../../../core/services/client-data.service';
import { CartService } from '../../../../core/services/cart.service';
import { AuthService } from '../../../../core/services/auth.service';
import { VideoTelemetryService } from '../../../../core/services/video-telemetry.service';
import { Dish, FeedItem } from '../../../../core/models/client';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AppHeaderComponent,
    AppBottomNavComponent,
    FoodPostComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  feedItems: FeedItem[] = [];
  videoNotFound: boolean = false;
  isLoadingVideo: boolean = false;

  activeVideoIndex: number = 0;
  private impressedVideos: Set<string> = new Set();

  @ViewChildren(FoodPostComponent) postComponents!: QueryList<FoodPostComponent>;
  @ViewChild('feedContent') feedContentRef!: ElementRef<HTMLElement>;

  private observer: IntersectionObserver | null = null;
  private scrollEndTimer: any = null;
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private telemetryService = inject(VideoTelemetryService);

  constructor(
    private clientDataService: ClientDataService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const videoId = params.get('id');
      if (videoId) {
        this.loadDeepLinkedVideo(videoId);
      } else {
        this.loadStandardFeed();
      }
    });
  }

  ngAfterViewInit(): void {
    this.postComponents.changes.subscribe(() => {
      requestAnimationFrame(() => {
        this.setupIntersectionObserver();
        this.setActiveVideo(0);
      });
    });
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.pauseAllVideos();
  }

  private loadStandardFeed(): void {
    this.videoNotFound = false;
    this.isLoadingVideo = false;
    this.clientDataService.getFeed().subscribe(items => {
      this.feedItems = items;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.setupIntersectionObserver();
          this.setActiveVideo(0);
        });
      });
    });
  }

  private loadDeepLinkedVideo(videoId: string): void {
    this.isLoadingVideo = true;
    this.videoNotFound = false;

    this.clientDataService.getFeedPublicationById(videoId).subscribe(targetItem => {
      this.isLoadingVideo = false;
      if (!targetItem) {
        this.videoNotFound = true;
        this.feedItems = [];
        return;
      }

      this.clientDataService.getFeed().subscribe(allFeed => {
        const remaining = allFeed.filter(item => String(item.id) !== String(targetItem.id));
        this.feedItems = [targetItem, ...remaining];
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            this.setupIntersectionObserver();
            this.setActiveVideo(0);
          });
        });
      });
    });
  }

  resetFeedView(): void {
    this.router.navigate(['/home']);
  }

  private setupIntersectionObserver(): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    if (this.observer) {
      this.observer.disconnect();
    }

    const options = {
      root: this.feedContentRef?.nativeElement || null,
      rootMargin: '0px',
      threshold: 0.65
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.65) {
          const targetEl = entry.target;
          const postsArray = this.postComponents?.toArray() || [];
          const index = postsArray.findIndex(p => p.elementRef?.nativeElement === targetEl);
          if (index !== -1 && index !== this.activeVideoIndex) {
            this.setActiveVideo(index);
          }
        }
      });
    }, options);

    if (this.postComponents) {
      this.postComponents.forEach(post => {
        if (post.elementRef?.nativeElement) {
          this.observer?.observe(post.elementRef.nativeElement);
        }
      });
    }
  }

  onFeedScroll(): void {
    if (this.scrollEndTimer !== null) {
      clearTimeout(this.scrollEndTimer);
    }

    this.scrollEndTimer = setTimeout(() => {
      this.scrollEndTimer = null;
      this.updateActiveCenteredVideoByBounds();
    }, 100);
  }

  private updateActiveCenteredVideoByBounds(): void {
    if (!this.postComponents || !this.feedContentRef) return;

    const container = this.feedContentRef.nativeElement;
    const containerRect = container.getBoundingClientRect();
    const containerCenterY = containerRect.top + containerRect.height / 2;

    let closestIndex = 0;
    let minDistance = Infinity;

    const postsArray = this.postComponents.toArray();
    postsArray.forEach((postComp, index) => {
      const el = postComp.elementRef?.nativeElement;
      if (el) {
        const rect = el.getBoundingClientRect();
        const postCenterY = rect.top + rect.height / 2;
        const distance = Math.abs(containerCenterY - postCenterY);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      }
    });

    this.setActiveVideo(closestIndex);
  }

  public setActiveVideo(targetIndex: number): void {
    if (!this.postComponents || this.postComponents.length === 0) return;

    if (targetIndex < 0) targetIndex = 0;
    if (targetIndex >= this.postComponents.length) targetIndex = this.postComponents.length - 1;

    this.activeVideoIndex = targetIndex;
    const postsArray = this.postComponents.toArray();

    postsArray.forEach((post, i) => {
      if (i === targetIndex) {
        post.playVideo();
        if (post.feedItem?.id && !this.impressedVideos.has(String(post.feedItem.id))) {
          this.impressedVideos.add(String(post.feedItem.id));
          this.telemetryService.logEvent(String(post.feedItem.id), 'IMPRESSION', {
            feedPosition: targetIndex
          });
        }
      } else {
        post.pauseVideo();
      }
    });
  }

  private pauseAllVideos(): void {
    if (this.postComponents) {
      this.postComponents.forEach(post => post.pauseVideo());
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
      error: (err) => {
        const msg = JSON.stringify(err || '').toLowerCase();
        if (msg.includes('variante') || msg.includes('option')) {
          this.router.navigate(['/product', dish.id]);
        } else {
          this.router.navigate(['/checkout']);
        }
      }
    });
  }

  onQuickCart(dish: Dish): void {
    if (!this.authService.requireAuth({
      title: 'Connectez-vous pour continuer',
      message: 'Vous devez avoir un compte AYYOU pour ajouter des produits à votre panier.',
      actionType: 'cart',
      returnUrl: '/home'
    })) {
      return;
    }

    this.cartService.addToCart(dish, 1).subscribe({
      next: () => {
        // Rest sur le feed vidéo sans quitter la page
      },
      error: (err) => {
        const msg = JSON.stringify(err || '').toLowerCase();
        if (msg.includes('variante') || msg.includes('option')) {
          this.router.navigate(['/product', dish.id]);
        }
      }
    });
  }
}
