import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AdminCatalogService } from '../../services/admin-catalog.service';
import {
  CatalogArticleItem,
  CatalogCategory,
  CatalogFilterTab,
  CatalogStatsSummary,
  ModerationStatus
} from '../../models/admin-catalog.models';
import { CatalogStatsComponent } from '../../components/catalog-stats/catalog-stats.component';
import { CatalogFiltersComponent } from '../../components/catalog-filters/catalog-filters.component';
import { CatalogTableComponent } from '../../components/catalog-table/catalog-table.component';
import { CatalogDetailsPanelComponent } from '../../components/catalog-details-panel/catalog-details-panel.component';
import { CategoryManagementModalComponent } from '../../components/category-management-modal/category-management-modal.component';

@Component({
  selector: 'app-admin-catalog',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CatalogStatsComponent,
    CatalogFiltersComponent,
    CatalogTableComponent,
    CatalogDetailsPanelComponent,
    CategoryManagementModalComponent
  ],
  templateUrl: './admin-catalog.component.html',
  styleUrls: ['./admin-catalog.component.scss']
})
export class AdminCatalogComponent implements OnInit {
  articles$: Observable<CatalogArticleItem[]>;
  selectedArticle$: Observable<CatalogArticleItem | null>;
  categories$: Observable<CatalogCategory[]>;
  statsSummary$: Observable<CatalogStatsSummary>;

  isCategoryModalOpen: boolean = false;
  editingCategory: CatalogCategory | null = null;

  private activeTabSubject = new BehaviorSubject<CatalogFilterTab>('ALL');
  private searchQuerySubject = new BehaviorSubject<string>('');
  private categorySubject = new BehaviorSubject<string>('ALL');
  private establishmentSubject = new BehaviorSubject<string>('ALL');

  activeTab$ = this.activeTabSubject.asObservable();

  constructor(
    private adminCatalogService: AdminCatalogService,
    private router: Router
  ) {
    this.selectedArticle$ = this.adminCatalogService.selectedArticle$;
    this.categories$ = this.adminCatalogService.categories$;
    this.statsSummary$ = this.adminCatalogService.getStatsSummary();

    this.articles$ = combineLatest([
      this.activeTabSubject,
      this.searchQuerySubject,
      this.categorySubject,
      this.establishmentSubject
    ]).pipe(
      switchMap(([tab, search, category, establishment]) =>
        this.adminCatalogService.filterArticles(tab, search, category, establishment)
      )
    );
  }

  ngOnInit(): void {}

  onTabChange(tab: CatalogFilterTab): void {
    this.activeTabSubject.next(tab);
  }

  onSearchChange(searchTerm: string): void {
    this.searchQuerySubject.next(searchTerm);
  }

  onCategoryChange(category: string): void {
    this.categorySubject.next(category);
  }

  onEstablishmentChange(establishment: string): void {
    this.establishmentSubject.next(establishment);
  }

  onSelectArticle(article: CatalogArticleItem): void {
    this.adminCatalogService.selectArticle(article);
  }

  onClosePanel(): void {
    this.adminCatalogService.selectArticle(null);
  }

  onUpdateModeration(event: { id: string; status: ModerationStatus }): void {
    this.adminCatalogService.updateModerationStatus(event.id, event.status);
  }

  onUpdateStock(event: { id: string; stockAyoo: number }): void {
    this.adminCatalogService.updateStockAllocation(event.id, event.stockAyoo);
  }

  onOpenAddCategoryModal(): void {
    this.editingCategory = null;
    this.isCategoryModalOpen = true;
  }

  onViewCategories(): void {
    this.router.navigate(['/admin/categories']);
  }

  onOpenEditCategoryModal(category?: CatalogCategory): void {
    if (category) {
      this.editingCategory = category;
    } else {
      // Default to CAT-014 (Thiéboudienne) for demonstration if no category passed
      const thiebCat = {
        id: 'cat-14',
        codeId: 'CAT-014',
        name: 'Thiéboudienne',
        type: 'Plat' as const,
        parentCategoryId: 'parent-1',
        parentCategoryName: 'Plats Traditionnels & Spécialités Locales',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&auto=format&fit=crop&q=80',
        fileName: 'thieb_rouge_dakar.jpg',
        isActive: true,
        itemCount: 142
      };
      this.editingCategory = thiebCat;
    }
    this.isCategoryModalOpen = true;
  }

  onCloseCategoryModal(): void {
    this.isCategoryModalOpen = false;
    this.editingCategory = null;
  }

  onSaveCategory(category: CatalogCategory): void {
    if (this.editingCategory) {
      this.adminCatalogService.updateCategory(category);
    } else {
      this.adminCatalogService.addCategory(category);
    }
  }

  onDeleteCategory(categoryId: string): void {
    this.adminCatalogService.deleteCategory(categoryId);
  }
}
