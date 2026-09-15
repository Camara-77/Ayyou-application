import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Restaurant } from '../../../../core/models/client';

@Component({
  selector: 'app-restaurant-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './restaurant-card.component.html',
  styleUrls: ['./restaurant-card.component.scss']
})
export class RestaurantCardComponent {
  @Input() restaurant!: Restaurant;

  private router = inject(Router);

  onCardClick(): void {
    if (this.restaurant && this.restaurant.id) {
      this.router.navigate(['/restaurant', this.restaurant.id]);
    }
  }
}
