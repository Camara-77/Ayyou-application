import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-food-interaction',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './food-interaction.component.html',
  styleUrls: ['./food-interaction.component.scss']
})
export class FoodInteractionComponent {
  @Input() likesCount: number = 1200;
  @Input() isLiked: boolean = false;
  @Input() sharesCount: number = 48;
  @Input() dishTitle: string = '';
  @Input() restaurantName: string = '';
  @Output() likeToggle = new EventEmitter<boolean>();
  @Output() share = new EventEmitter<void>();
  @Output() saveClick = new EventEmitter<boolean>();

  isSaved: boolean = false;
  showSaveModal: boolean = false;

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

  onSave(event: Event): void {
    event.stopPropagation();
    this.isSaved = !this.isSaved;
    this.showSaveModal = true;
    this.saveClick.emit(this.isSaved);
  }

  closeSaveModal(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.showSaveModal = false;
  }

  async onShare(event: Event): Promise<void> {
    event.stopPropagation();
    const shareData = {
      title: this.dishTitle || 'AYYOU Plat',
      text: `Découvrez "${this.dishTitle}" proposé par ${this.restaurantName || 'notre restaurant'} sur AYYOU !`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or share failed silently
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        alert('Lien de la publication copié dans le presse-papier !');
      } catch (err) {
        // Clipboard fallback
      }
    }
    this.share.emit();
  }

  formatCount(count: number): string {
    if (count >= 1000) {
      return (count / 1000).toFixed(1).replace('.0', '') + 'k';
    }
    return count.toString();
  }
}
