import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-button.component.html',
  styleUrls: ['./order-button.component.scss']
})
export class OrderButtonComponent {
  @Input() label: string = 'Commander';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() disabled: boolean = false;
  @Output() orderClick = new EventEmitter<Event>();

  onClick(event: Event): void {
    event.stopPropagation();
    if (!this.disabled) {
      this.orderClick.emit(event);
    }
  }
}
