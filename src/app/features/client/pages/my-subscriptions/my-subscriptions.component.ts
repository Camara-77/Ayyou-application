import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { AppBottomNavComponent } from '../../components/app-bottom-nav/app-bottom-nav.component';
import { ClientDataService } from '../../../../core/services/client-data.service';
import { SubscriptionItem } from '../../../../core/models/client';

@Component({
  selector: 'app-my-subscriptions',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AppHeaderComponent,
    AppBottomNavComponent
  ],
  templateUrl: './my-subscriptions.component.html',
  styleUrls: ['./my-subscriptions.component.scss']
})
export class MySubscriptionsComponent implements OnInit {
  private clientDataService = inject(ClientDataService);
  private router = inject(Router);

  subscriptions: SubscriptionItem[] = [];
  isLoading: boolean = true;
  unsubscribingIds: Set<string | number> = new Set();

  ngOnInit(): void {
    this.loadSubscriptions();
  }

  loadSubscriptions(): void {
    this.isLoading = true;
    this.clientDataService.getMySubscriptions().subscribe({
      next: (subs) => {
        this.subscriptions = subs;
        this.isLoading = false;
      },
      error: () => {
        this.subscriptions = [];
        this.isLoading = false;
      }
    });
  }

  unsubscribe(event: Event, item: SubscriptionItem): void {
    event.stopPropagation();
    const etabId = item.etablissement || item.etablissementDetail?.id;
    if (!etabId || this.unsubscribingIds.has(item.id)) return;

    this.unsubscribingIds.add(item.id);
    this.clientDataService.unsubscribeFromEstablishment(etabId).subscribe({
      next: () => {
        this.subscriptions = this.subscriptions.filter(s => s.id !== item.id);
        this.unsubscribingIds.delete(item.id);
      },
      error: () => {
        this.unsubscribingIds.delete(item.id);
      }
    });
  }

  openEstablishment(item: SubscriptionItem): void {
    const etabId = item.etablissement || item.etablissementDetail?.id;
    if (etabId) {
      this.router.navigate(['/restaurant', etabId]);
    }
  }

  goToDiscovery(): void {
    this.router.navigate(['/home']);
  }
}
