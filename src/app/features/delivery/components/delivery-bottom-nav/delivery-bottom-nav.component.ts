import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-delivery-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './delivery-bottom-nav.component.html',
  styleUrls: ['./delivery-bottom-nav.component.scss']
})
export class DeliveryBottomNavComponent implements OnInit, OnDestroy {
  @Input() activeTab: 'home' | 'deliveries' | 'history' | 'profile' = 'home';
  @Input() hasActiveDelivery: boolean = false;

  private routerSub?: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.setActiveTabFromUrl(this.router.url);

    this.routerSub = this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.setActiveTabFromUrl(event.urlAfterRedirects || event.url);
    });
  }

  private setActiveTabFromUrl(url: string): void {
    if (url.includes('/history') || url.includes('/livraisons')) {
      this.activeTab = 'history';
    } else if (url.includes('/profile')) {
      this.activeTab = 'profile';
    } else if (url.includes('/navigation') || url.includes('/arrival') || url.includes('/validation') || url.includes('/completed') || url.includes('/missions') || url.includes('/detail')) {
      this.activeTab = 'deliveries';
    } else if (url.includes('/home') || url.includes('/delivery') || url.includes('/livreur')) {
      this.activeTab = 'home';
    }
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }
}

