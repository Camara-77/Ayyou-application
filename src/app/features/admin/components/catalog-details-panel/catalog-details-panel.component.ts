import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogArticleItem, ModerationStatus } from '../../models/admin-catalog.models';

@Component({
  selector: 'app-catalog-details-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalog-details-panel.component.html',
  styleUrls: ['./catalog-details-panel.component.scss']
})
export class CatalogDetailsPanelComponent {
  @Input() article: CatalogArticleItem | null = null;
  @Output() closePanel = new EventEmitter<void>();
  @Output() updateModeration = new EventEmitter<{ id: string; status: ModerationStatus }>();
  @Output() updateStock = new EventEmitter<{ id: string; stockAyoo: number }>();

  editingStockAyoo: number = 0;
  isEditingStock: boolean = false;

  ngOnChanges(): void {
    if (this.article) {
      this.editingStockAyoo = this.article.stockAyoo;
    }
  }

  onClose(): void {
    this.closePanel.emit();
  }

  onValidate(): void {
    if (this.article) {
      this.updateModeration.emit({ id: this.article.id, status: 'VALIDE' });
    }
  }

  onRequestCorrection(): void {
    if (this.article) {
      this.updateModeration.emit({ id: this.article.id, status: 'A_CORRIGER' });
    }
  }

  onReject(): void {
    if (this.article) {
      this.updateModeration.emit({ id: this.article.id, status: 'REFUSE' });
    }
  }

  onSaveStockAyoo(): void {
    if (this.article) {
      this.updateStock.emit({ id: this.article.id, stockAyoo: this.editingStockAyoo });
      this.isEditingStock = false;
    }
  }
}
