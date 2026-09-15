import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogCategory } from '../../models/admin-catalog.models';

@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-card.component.html',
  styleUrls: ['./category-card.component.scss']
})
export class CategoryCardComponent {
  @Input() category!: CatalogCategory;

  @Output() editCategory = new EventEmitter<CatalogCategory>();
  @Output() toggleStatus = new EventEmitter<CatalogCategory>();
  @Output() deleteCategory = new EventEmitter<CatalogCategory>();

  onEdit(): void {
    this.editCategory.emit(this.category);
  }

  onToggle(): void {
    this.toggleStatus.emit(this.category);
  }

  onDelete(): void {
    this.deleteCategory.emit(this.category);
  }
}
