import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogCategory } from '../../models/admin-catalog.models';

@Component({
  selector: 'app-category-reorder-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-reorder-modal.component.html',
  styleUrls: ['./category-reorder-modal.component.scss']
})
export class CategoryReorderModalComponent implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() categories: CatalogCategory[] = [];

  @Output() closeModal = new EventEmitter<void>();
  @Output() saveOrder = new EventEmitter<CatalogCategory[]>();

  orderedCategories: CatalogCategory[] = [];

  ngOnChanges(): void {
    if (this.categories) {
      this.orderedCategories = [...this.categories];
    }
  }

  moveUp(index: number): void {
    if (index > 0) {
      const temp = this.orderedCategories[index];
      this.orderedCategories[index] = this.orderedCategories[index - 1];
      this.orderedCategories[index - 1] = temp;
    }
  }

  moveDown(index: number): void {
    if (index < this.orderedCategories.length - 1) {
      const temp = this.orderedCategories[index];
      this.orderedCategories[index] = this.orderedCategories[index + 1];
      this.orderedCategories[index + 1] = temp;
    }
  }

  onSave(): void {
    this.saveOrder.emit(this.orderedCategories);
    this.onClose();
  }

  onClose(): void {
    this.closeModal.emit();
  }
}
