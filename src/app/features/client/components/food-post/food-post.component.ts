import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { OrderButtonComponent } from '../order-button/order-button.component';
import { FoodInteractionComponent } from '../food-interaction/food-interaction.component';
import { FeedItem, Dish } from '../../../../core/models/client';
import { ClientDataService } from '../../../../core/services/client-data.service';
import { AuthService } from '../../../../core/services/auth.service';
import { VideoTelemetryService } from '../../../../core/services/video-telemetry.service';
import { environment } from '../../../../../environments/environment';

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
export class FoodPostComponent implements OnDestroy {
  @Input() feedItem!: FeedItem;
  @Input() mediaList: string[] = []; // For multi-image support
  @Input() feedPosition: number = 0;
  @Output() orderDish = new EventEmitter<Dish>();
  @Output() quickCart = new EventEmitter<Dish>();

  @ViewChild('videoElement') videoRef?: ElementRef<HTMLVideoElement>;

  showShareModal: boolean = false;
  toastMessage: string = '';

  private clientDataService = inject(ClientDataService);
  private authService = inject(AuthService);
  private telemetryService = inject(VideoTelemetryService);
  private router = inject(Router);
  private clickTimeout: any = null;
  private readonly DOUBLE_CLICK_DELAY = 280; // ms

  // Telemetry Tracking State
  private playStartTime: number = 0;
  private totalWatchTimeSeconds: number = 0;
  private hasLoggedPlay: boolean = false;
  private hasLoggedCompleted: boolean = false;
  private hasLoggedSkip: boolean = false;

  constructor(public elementRef: ElementRef) {}

  ngOnDestroy(): void {
    this.flushPlaybackTelemetry();
  }

  public static globalMuted: boolean = true;

  get isMuted(): boolean {
    return FoodPostComponent.globalMuted;
  }

  toggleSound(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    FoodPostComponent.globalMuted = !FoodPostComponent.globalMuted;
    if (this.videoRef?.nativeElement) {
      const video = this.videoRef.nativeElement;
      video.muted = FoodPostComponent.globalMuted;
      if (!FoodPostComponent.globalMuted && video.paused) {
        video.play().catch(() => {});
      }
    }
  }

  playVideo(allowSound: boolean = false): void {
    if (this.feedItem?.mediaType === 'video' && this.videoRef?.nativeElement) {
      const video = this.videoRef.nativeElement;
      video.muted = allowSound ? false : FoodPostComponent.globalMuted;
      const promise = video.play();
      if (promise !== undefined) {
        promise.catch(error => {
          console.warn('Lecture vidéo avec son impossible, bascule en muet :', error);
          if (!video.muted) {
            video.muted = true;
            video.play().catch(() => {});
          }
        });
      }
    }
  }

  pauseVideo(): void {
    if (this.feedItem?.mediaType === 'video' && this.videoRef?.nativeElement) {
      const video = this.videoRef.nativeElement;
      video.pause();
    }
  }

  // HTML5 Video Event Handlers for Telemetry
  onVideoPlay(): void {
    if (!this.feedItem?.id) return;
    this.playStartTime = Date.now();

    if (!this.hasLoggedPlay) {
      this.hasLoggedPlay = true;
      this.telemetryService.logEvent(String(this.feedItem.id), 'PLAY', {
        feedPosition: this.feedPosition
      });
    }
  }

  onVideoPause(): void {
    this.flushPlaybackTelemetry();
  }

  onVideoTimeUpdate(): void {
    if (this.playStartTime > 0) {
      const sessionSeconds = (Date.now() - this.playStartTime) / 1000;
      const video = this.videoRef?.nativeElement;
      const duration = video?.duration || 0;
      const current = video?.currentTime || 0;
      const progress = duration > 0 ? (current / duration) * 100 : 0;

      // Log progress / completion at 100%
      if (progress >= 98 && !this.hasLoggedCompleted && this.feedItem?.id) {
        this.hasLoggedCompleted = true;
        this.telemetryService.logEvent(String(this.feedItem.id), 'COMPLETED', {
          watchTimeSeconds: Math.round((this.totalWatchTimeSeconds + sessionSeconds) * 10) / 10,
          videoDurationSeconds: duration,
          progressPercent: 100,
          feedPosition: this.feedPosition
        });
      }
    }
  }

  onVideoEnded(): void {
    if (this.feedItem?.id && !this.hasLoggedCompleted) {
      this.hasLoggedCompleted = true;
      const video = this.videoRef?.nativeElement;
      this.telemetryService.logEvent(String(this.feedItem.id), 'COMPLETED', {
        watchTimeSeconds: Math.round(this.totalWatchTimeSeconds * 10) / 10,
        videoDurationSeconds: video?.duration || 0,
        progressPercent: 100,
        feedPosition: this.feedPosition
      });
    }
  }

  private flushPlaybackTelemetry(): void {
    if (!this.feedItem?.id) return;

    if (this.playStartTime > 0) {
      const sessionSeconds = (Date.now() - this.playStartTime) / 1000;
      this.totalWatchTimeSeconds += sessionSeconds;
      this.playStartTime = 0;

      const video = this.videoRef?.nativeElement;
      const duration = video?.duration || 0;
      const current = video?.currentTime || 0;
      const progress = duration > 0 ? (current / duration) * 100 : 0;

      // Check Skip (watch time < 3.0s and not completed)
      if (this.totalWatchTimeSeconds < 3.0 && !this.hasLoggedCompleted && !this.hasLoggedSkip) {
        this.hasLoggedSkip = true;
        this.telemetryService.logEvent(String(this.feedItem.id), 'SKIP', {
          watchTimeSeconds: Math.round(this.totalWatchTimeSeconds * 10) / 10,
          videoDurationSeconds: duration,
          progressPercent: progress,
          feedPosition: this.feedPosition
        });
      }

      // Log PAUSE and WATCH accumulated state
      this.telemetryService.logEvent(String(this.feedItem.id), 'PAUSE', {
        watchTimeSeconds: Math.round(this.totalWatchTimeSeconds * 10) / 10,
        videoDurationSeconds: duration,
        progressPercent: progress,
        feedPosition: this.feedPosition
      });
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
        video.muted = FoodPostComponent.globalMuted;
        video.play().catch(() => {
          if (!video.muted) {
            video.muted = true;
            video.play().catch(() => {});
          }
        });
      } else {
        video.pause();
      }
    }
  }

  private handleDoubleTapLike(): void {
    if (!this.authService.requireAuth({
      title: 'Connectez-vous pour liker',
      message: 'Créez un compte ou connectez-vous pour enregistrer vos interactions.',
      actionType: 'like',
      actionPayload: { dishId: this.feedItem?.dish?.id, feedId: this.feedItem?.id }
    })) {
      return;
    }

    if (this.feedItem) {
      if (!this.feedItem.isLiked) {
        this.feedItem.isLiked = true;
        this.feedItem.likesCount = (this.feedItem.likesCount || 0) + 1;
        this.syncLikeStatusWithBackend(true);
      }
    }
  }

  onLikeToggle(isLiked: boolean): void {
    if (!this.authService.requireAuth({
      title: 'Connectez-vous pour liker',
      message: 'Créez un compte ou connectez-vous pour enregistrer vos interactions.',
      actionType: 'like',
      actionPayload: { dishId: this.feedItem?.dish?.id, feedId: this.feedItem?.id }
    })) {
      return;
    }

    if (this.feedItem) {
      this.feedItem.isLiked = isLiked;
      this.syncLikeStatusWithBackend(isLiked);
    }
  }

  private syncLikeStatusWithBackend(isLiked: boolean): void {
    if (!this.feedItem) return;
    if (this.feedItem.id) {
      const eventType = isLiked ? 'LIKE' : 'UNLIKE';
      this.telemetryService.logEvent(String(this.feedItem.id), eventType, {
        feedPosition: this.feedPosition
      });

      if (isLiked) {
        this.clientDataService.likeFeedPublication(this.feedItem.id).subscribe({ error: () => {} });
      } else {
        this.clientDataService.unlikeFeedPublication(this.feedItem.id).subscribe({ error: () => {} });
      }
    }
  }

  onDishClick(event: Event): void {
    event.stopPropagation();
    if (this.feedItem?.dish?.id) {
      if (this.feedItem?.id) {
        this.telemetryService.logEvent(String(this.feedItem.id), 'DISH_CLICK', {
          feedPosition: this.feedPosition
        });
      }
      this.router.navigate(['/product', this.feedItem.dish.id]);
    }
  }

  onOrder(event: Event): void {
    event.stopPropagation();
    if (!this.authService.requireAuth({
      title: 'Connectez-vous pour continuer',
      message: 'Vous devez avoir un compte AYYOU pour ajouter des produits à votre panier et passer une commande.',
      actionType: 'order',
      returnUrl: '/cart'
    })) {
      return;
    }

    if (this.feedItem?.id) {
      this.telemetryService.logEvent(String(this.feedItem.id), 'CART_ADD', {
        feedPosition: this.feedPosition
      });
    }

    this.orderDish.emit(this.feedItem.dish);
  }

  onQuickCart(event: Event): void {
    event.stopPropagation();
    if (!this.authService.requireAuth({
      title: 'Connectez-vous pour continuer',
      message: 'Vous devez avoir un compte AYYOU pour ajouter des produits à votre panier et passer une commande.',
      actionType: 'cart',
      returnUrl: '/home'
    })) {
      return;
    }

    if (this.feedItem?.id) {
      this.telemetryService.logEvent(String(this.feedItem.id), 'CART_ADD', {
        feedPosition: this.feedPosition
      });
    }

    this.showToast('Ajouté au panier');
    this.quickCart.emit(this.feedItem.dish);
  }

  formatPrice(price: number): string {
    return price.toLocaleString('fr-FR') + ' FCFA';
  }

  get videoShareUrl(): string {
    const origin = (typeof window !== 'undefined' && window.location?.origin)
      ? window.location.origin
      : (environment.appUrl || 'http://localhost:4200');
    return `${origin}/feed/video/${this.feedItem?.id}`;
  }

  openShareModal(): void {
    this.showShareModal = true;
    if (this.feedItem?.id) {
      this.telemetryService.logEvent(String(this.feedItem.id), 'SHARE', {
        feedPosition: this.feedPosition
      });
    }
  }

  closeShareModal(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.showShareModal = false;
  }

  async shareNative(event?: Event): Promise<void> {
    if (event) event.stopPropagation();
    const shareData = {
      title: 'Découvrez cette vidéo sur AYYOU',
      text: 'Découvrez cette vidéo sur AYYOU',
      url: this.videoShareUrl
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        this.closeShareModal();
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      this.copyLink();
    }
  }

  shareWhatsApp(event?: Event): void {
    if (event) event.stopPropagation();
    const text = encodeURIComponent(`Découvrez cette vidéo sur AYYOU : ${this.videoShareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    this.closeShareModal();
  }

  shareTelegram(event?: Event): void {
    if (event) event.stopPropagation();
    const url = encodeURIComponent(this.videoShareUrl);
    const text = encodeURIComponent('Découvrez cette vidéo sur AYYOU');
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
    this.closeShareModal();
  }

  shareEmail(event?: Event): void {
    if (event) event.stopPropagation();
    const subject = encodeURIComponent('Découvrez cette vidéo sur AYYOU');
    const body = encodeURIComponent(`Regarde cette vidéo sur AYYOU : ${this.videoShareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    this.closeShareModal();
  }

  shareInstagram(event?: Event): void {
    if (event) event.stopPropagation();
    this.shareNative(event);
  }

  copyLink(event?: Event): void {
    if (event) event.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(this.videoShareUrl).then(() => {
        this.showToast('Lien de la vidéo copié !');
        this.closeShareModal();
      }).catch(() => {
        this.showToast('Impossible de copier le lien');
      });
    }
  }

  private showToast(msg: string): void {
    this.toastMessage = msg;
    setTimeout(() => {
      this.toastMessage = '';
    }, 2500);
  }
}
