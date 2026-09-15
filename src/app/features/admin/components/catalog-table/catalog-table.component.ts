import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogArticleItem } from '../../models/admin-catalog.models';

@Component({
  selector: 'app-catalog-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalog-table.component.html',
  styleUrls: ['./catalog-table.component.scss']
})
export class CatalogTableComponent {
  @Input() articles: CatalogArticleItem[] = [];
  @Input() selectedArticle: CatalogArticleItem | null = null;
  @Output() selectArticle = new EventEmitter<CatalogArticleItem>();

  onSelectRow(article: CatalogArticleItem): void {
    this.selectArticle.emit(article);
  }
}
