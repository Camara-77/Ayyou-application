import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quantity-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quantity-selector.component.html',
  styleUrls: ['./quantity-selector.component.scss']
})
export class QuantitySelectorComponent {
  @Input() quantity: number = 1;
  @Input() min: number = 1;
  @Input() max: number = 99;
  @Output() quantityChange = new EventEmitter<number>();

  decrement(): void {
    if (this.quantity > this.min) {
      this.quantity--;
      this.quantityChange.emit(this.quantity);
    }
  }

  increment(): void {
    if (this.quantity < this.max) {
      this.quantity++;
      this.quantityChange.emit(this.quantity);
    }
  }
}
