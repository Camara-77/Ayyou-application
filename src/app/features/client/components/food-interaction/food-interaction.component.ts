import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-food-interaction',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './food-interaction.component.html',
  styleUrls: ['./food-interaction.component.scss']
})
export class FoodInteractionComponent {
  @Input() videoId: string | number = '';
  @Input() likesCount: number = 0;
  @Input() isLiked: boolean = false;
  @Input() sharesCount: number = 0;
  @Input() dishTitle: string = '';
  @Input() restaurantName: string = '';
  @Output() likeToggle = new EventEmitter<boolean>();
  @Output() share = new EventEmitter<void>();

  showShareModal: boolean = false;
  toastMessage: string = '';

  onLike(event: Event): void {
    event.stopPropagation();
    this.isLiked = !this.isLiked;
    if (this.isLiked) {
      this.likesCount++;
    } else {
      this.likesCount--;
    }
    this.likeToggle.emit(this.isLiked);
  }

  onShare(event: Event): void {
    console.log('[DIAGNOSTIC] CLICK SHARE -> FoodInteractionComponent.onShare');
    event.stopPropagation();
    this.share.emit();
  }

  closeShareModal(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.showShareModal = false;
  }

  get videoShareUrl(): string {
    const origin = (typeof window !== 'undefined' && window.location?.origin)
      ? window.location.origin
      : (environment.appUrl || 'http://localhost:4200');
    return `${origin}/feed/video/${this.videoId}`;
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
        this.incrementShareCount();
      } catch (err) {
        // Cancelled silently
      }
    } else {
      this.copyLink();
    }
    this.closeShareModal();
  }

  shareWhatsApp(event?: Event): void {
    if (event) event.stopPropagation();
    const text = `Découvrez cette vidéo sur AYYOU :\n${this.videoShareUrl}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
    this.incrementShareCount();
    this.closeShareModal();
  }

  shareEmail(event?: Event): void {
    if (event) event.stopPropagation();
    const subject = 'Découvrez cette vidéo sur AYYOU';
    const body = `Bonjour,\n\nJe voulais te partager cette vidéo découverte sur AYYOU :\n\n${this.videoShareUrl}\n\nÀ bientôt.`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (typeof window !== 'undefined') {
      window.location.href = mailtoUrl;
    }
    this.incrementShareCount();
    this.closeShareModal();
  }

  shareTelegram(event?: Event): void {
    if (event) event.stopPropagation();
    const text = 'Découvrez cette vidéo sur AYYOU';
    const url = `https://t.me/share/url?url=${encodeURIComponent(this.videoShareUrl)}&text=${encodeURIComponent(text)}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
    this.incrementShareCount();
    this.closeShareModal();
  }

  shareInstagram(event?: Event): void {
    if (event) event.stopPropagation();
    this.shareNative();
  }

  async copyLink(event?: Event): Promise<void> {
    if (event) event.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(this.videoShareUrl);
        this.showToast('Lien de la vidéo copié !');
        this.incrementShareCount();
      } catch (e) {
        this.showToast('Lien de la vidéo : ' + this.videoShareUrl);
      }
    } else {
      this.showToast('Lien de la vidéo : ' + this.videoShareUrl);
    }
    this.closeShareModal();
  }

  private incrementShareCount(): void {
    this.sharesCount++;
    this.share.emit();
  }

  private showToast(msg: string): void {
    this.toastMessage = msg;
    setTimeout(() => {
      this.toastMessage = '';
    }, 3000);
  }

  formatCount(count: number): string {
    if (count >= 1000) {
      return (count / 1000).toFixed(1).replace('.0', '') + 'k';
    }
    return count.toString();
  }
}
