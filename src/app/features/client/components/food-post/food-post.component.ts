import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { OrderButtonComponent } from '../order-button/order-button.component';
import { FoodInteractionComponent } from '../food-interaction/food-interaction.component';
import { FeedItem, Dish } from '../../../../core/models/client';

@Component({
  selector: 'app-food-post',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    OrderButtonComponent,
    FoodInteractionComponent
  ],
  templateUrl: './food-post.component.html',
  styleUrls: ['./food-post.component.scss']
})
export class FoodPostComponent {
  @Input() feedItem!: FeedItem;
  @Input() mediaList: string[] = []; // For multi-image support
  @Output() orderDish = new EventEmitter<Dish>();
  @Output() quickCart = new EventEmitter<Dish>();

  @ViewChild('videoElement') videoRef?: ElementRef<HTMLVideoElement>;

  private router = inject(Router);
  private clickTimeout: any = null;
  private readonly DOUBLE_CLICK_DELAY = 280; // ms

  constructor(public elementRef: ElementRef) {}

  playVideo(): void {
    if (this.feedItem?.mediaType === 'video' && this.videoRef?.nativeElement) {
      const video = this.videoRef.nativeElement;
      video.play().catch(() => {});
    }
  }

  pauseVideo(): void {
    if (this.feedItem?.mediaType === 'video' && this.videoRef?.nativeElement) {
      const video = this.videoRef.nativeElement;
      video.pause();
    }
  }

  onMediaTap(event: Event): void {
    event.stopPropagation();

    if (this.clickTimeout !== null) {
      // Double tap detected -> Like post
      clearTimeout(this.clickTimeout);
      this.clickTimeout = null;
      this.handleDoubleTapLike();
    } else {
      // Single tap detected -> Wait to distinguish play/pause vs double-tap
      this.clickTimeout = setTimeout(() => {
        this.clickTimeout = null;
        this.toggleVideoPlayPause();
      }, this.DOUBLE_CLICK_DELAY);
    }
  }

  private toggleVideoPlayPause(): void {
    if (this.feedItem?.mediaType === 'video' && this.videoRef?.nativeElement) {
      const video = this.videoRef.nativeElement;
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }
  }

  private handleDoubleTapLike(): void {
    if (this.feedItem) {
      if (!this.feedItem.isLiked) {
        this.feedItem.isLiked = true;
        this.feedItem.likesCount = (this.feedItem.likesCount || 0) + 1;
      }
    }
  }

  onLikeToggle(isLiked: boolean): void {
    if (this.feedItem) {
      this.feedItem.isLiked = isLiked;
    }
  }

  onDishClick(event: Event): void {
    event.stopPropagation();
    if (this.feedItem?.dish?.id) {
      this.router.navigate(['/product', this.feedItem.dish.id]);
    }
  }

  onOrder(event: Event): void {
    event.stopPropagation();
    this.orderDish.emit(this.feedItem.dish);
  }

  onQuickCart(event: Event): void {
    event.stopPropagation();
    this.quickCart.emit(this.feedItem.dish);
  }

  formatPrice(price: number): string {
    return price.toLocaleString('fr-FR') + ' FCFA';
  }
}
