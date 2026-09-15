import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Dish } from '../../../../core/models/client';

@Component({
  selector: 'app-dish-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dish-card.component.html',
  styleUrls: ['./dish-card.component.scss']
})
export class DishCardComponent {
  @Input() dish!: Dish;
  @Input() compact: boolean = false;
  @Output() add = new EventEmitter<Dish>();

  private router = inject(Router);

  onCardClick(): void {
    if (this.dish && this.dish.id) {
      this.router.navigate(['/product', this.dish.id]);
    }
  }

  onAdd(event: Event): void {
    event.stopPropagation();
    if (this.dish && this.dish.id) {
      this.router.navigate(['/product', this.dish.id]);
    }
  }

  formatPrice(price: number): string {
    return price.toLocaleString('fr-FR') + ' FCFA';
  }
}
