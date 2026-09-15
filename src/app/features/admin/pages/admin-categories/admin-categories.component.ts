import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { AdminCatalogService } from '../../services/admin-catalog.service';
import { CatalogCategory } from '../../models/admin-catalog.models';
import { CategoryCardComponent } from '../../components/category-card/category-card.component';
import { CategoryManagementModalComponent } from '../../components/category-management-modal/category-management-modal.component';
import { CategoryReorderModalComponent } from '../../components/category-reorder-modal/category-reorder-modal.component';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CategoryCardComponent,
    CategoryManagementModalComponent,
    CategoryReorderModalComponent
  ],
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.scss']
})
export class AdminCategoriesComponent implements OnInit {
  categories$: Observable<CatalogCategory[]>;
  allCategories$: Observable<CatalogCategory[]>;

  typeTabSubject = new BehaviorSubject<string>('ALL');
  statusTabSubject = new BehaviorSubject<string>('ALL');
  searchSubject = new BehaviorSubject<string>('');
  sortOrderSubject = new BehaviorSubject<string>('PRIORITY');

  typeTab$ = this.typeTabSubject.asObservable();
  statusTab$ = this.statusTabSubject.asObservable();
  searchQuery: string = '';

  isManagementModalOpen: boolean = false;
  isReorderModalOpen: boolean = false;
  editingCategory: CatalogCategory | null = null;

  constructor(private adminCatalogService: AdminCatalogService) {
    this.allCategories$ = this.adminCatalogService.categories$;

    this.categories$ = combineLatest([
      this.typeTabSubject,
      this.statusTabSubject,
      this.searchSubject
    ]).pipe(
      switchMap(([typeTab, statusTab, search]) =>
        this.adminCatalogService.filterCategories(typeTab, statusTab, search)
      )
    );
  }

  ngOnInit(): void {}

  onTypeTabSelect(type: string): void {
    this.typeTabSubject.next(type);
  }

  onStatusTabSelect(status: string): void {
    this.statusTabSubject.next(status);
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchQuery);
  }

  onOpenAddModal(): void {
    this.editingCategory = null;
    this.isManagementModalOpen = true;
  }

  onEditCategory(category: CatalogCategory): void {
    this.editingCategory = category;
    this.isManagementModalOpen = true;
  }

  onCloseManagementModal(): void {
    this.isManagementModalOpen = false;
    this.editingCategory = null;
  }

  onSaveCategory(category: CatalogCategory): void {
    if (this.editingCategory) {
      this.adminCatalogService.updateCategory(category);
    } else {
      this.adminCatalogService.addCategory(category);
    }
  }

  onToggleStatus(category: CatalogCategory): void {
    this.adminCatalogService.toggleCategoryStatus(category.id);
  }

  onDeleteCategory(categoryIdOrCategory: string | CatalogCategory): void {
    const id = typeof categoryIdOrCategory === 'string' ? categoryIdOrCategory : categoryIdOrCategory.id;
    this.adminCatalogService.deleteCategory(id);
  }

  onOpenReorderModal(): void {
    this.isReorderModalOpen = true;
  }

  onCloseReorderModal(): void {
    this.isReorderModalOpen = false;
  }

  onSaveReorder(categories: CatalogCategory[]): void {
    this.adminCatalogService.reorderCategories(categories);
  }
}
