import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app-bottom-nav.component.html',
  styleUrls: ['./app-bottom-nav.component.scss']
})
export class AppBottomNavComponent implements OnInit, OnDestroy {
  @Input() activeTab: 'home' | 'search' | 'cart' | 'profile' = 'home';

  cartItemCount: number = 0;
  private sub?: Subscription;
  private routerSub?: Subscription;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sub = this.cartService.items$.subscribe(items => {
      this.cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    });

    this.setActiveTabFromUrl(this.router.url);

    this.routerSub = this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.setActiveTabFromUrl(event.urlAfterRedirects || event.url);
    });
  }

  private setActiveTabFromUrl(url: string): void {
    if (url.includes('/home')) {
      this.activeTab = 'home';
    } else if (url.includes('/search')) {
      this.activeTab = 'search';
    } else if (url.includes('/cart') || url.includes('/checkout')) {
      this.activeTab = 'cart';
    } else if (url.includes('/profile')) {
      this.activeTab = 'profile';
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.routerSub?.unsubscribe();
  }
}
