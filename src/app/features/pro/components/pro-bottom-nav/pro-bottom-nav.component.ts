import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-pro-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pro-bottom-nav.component.html',
  styleUrls: ['./pro-bottom-nav.component.scss']
})
export class ProBottomNavComponent implements OnInit, OnDestroy {
  @Input() activeTab: 'dashboard' | 'statistics' | 'studio' | 'profile' = 'dashboard';

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
    if (url.includes('/pro/statistics')) {
      this.activeTab = 'statistics';
    } else if (url.includes('/pro/studio')) {
      this.activeTab = 'studio';
    } else if (url.includes('/pro/profile') || url.includes('/pro/menu')) {
      this.activeTab = 'profile';
    } else if (url.includes('/pro/dashboard') || url.includes('/pro/orders') || url.includes('/pro/notifications')) {
      this.activeTab = 'dashboard';
    }
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }
}
