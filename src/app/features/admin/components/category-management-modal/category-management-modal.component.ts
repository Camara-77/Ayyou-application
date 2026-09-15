import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogCategory, CategoryType } from '../../models/admin-catalog.models';

@Component({
  selector: 'app-category-management-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-management-modal.component.html',
  styleUrls: ['./category-management-modal.component.scss']
})
export class CategoryManagementModalComponent implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() categories: CatalogCategory[] = [];
  @Input() editingCategory: CatalogCategory | null = null;

  @Output() closeModal = new EventEmitter<void>();
  @Output() saveCategory = new EventEmitter<CatalogCategory>();
  @Output() deleteCategory = new EventEmitter<string>();

  mode: 'ADD' | 'EDIT' = 'ADD';

  // Form Fields
  catId: string = '';
  catCodeId: string = 'CAT-014';
  name: string = '';
  type: CategoryType = 'Plat';
  parentCategoryId: string = '';
  imageUrl: string = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&auto=format&fit=crop&q=80';
  fileName: string = 'thieb_rouge_dakar.jpg';
  isActive: boolean = true;
  description: string = '';

  // UI & Validation States
  showDeleteConfirm: boolean = false;
  isSaving: boolean = false;
  nameTouched: boolean = false;
  toastMessage: string | null = null;

  readonly maxNameLength: number = 40;

  availableTypes: { key: CategoryType; label: string }[] = [
    { key: 'Restaurant', label: 'Restaurant' },
    { key: 'Commerce', label: 'Commerce' },
    { key: 'Plat', label: 'Plat (Actif)' },
    { key: 'Produit', label: 'Produit' }
  ];

  parentCategoryOptions = [
    { id: 'parent-1', name: 'Plats Traditionnels & Spécialités Locales' },
    { id: 'parent-2', name: 'Grillades & Braisés' },
    { id: 'parent-3', name: 'Burgers & Fast-Food' },
    { id: 'parent-4', name: 'Épicerie & Fruits Frais' },
    { id: 'parent-5', name: 'Boissons & Rafraîchissements' }
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editingCategory'] || changes['isOpen']) {
      if (this.editingCategory) {
        this.mode = 'EDIT';
        this.catId = this.editingCategory.id;
        this.catCodeId = this.editingCategory.codeId || 'CAT-014';
        this.name = this.editingCategory.name || '';
        this.type = this.editingCategory.type || 'Plat';
        this.parentCategoryId = this.editingCategory.parentCategoryId || 'parent-1';
        this.imageUrl = this.editingCategory.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&auto=format&fit=crop&q=80';
        this.fileName = this.editingCategory.fileName || 'thieb_rouge_dakar.jpg';
        this.isActive = this.editingCategory.isActive !== undefined ? this.editingCategory.isActive : true;
        this.description = this.editingCategory.description || '';
      } else {
        this.mode = 'ADD';
        this.resetForm();
      }
      this.showDeleteConfirm = false;
      this.nameTouched = false;
    }
  }

  resetForm(): void {
    this.catId = 'cat-' + Date.now();
    this.catCodeId = 'CAT-' + Math.floor(100 + Math.random() * 900);
    this.name = '';
    this.type = 'Plat';
    this.parentCategoryId = 'parent-1';
    this.imageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&auto=format&fit=crop&q=80';
    this.fileName = 'nouvelle_vignette.jpg';
    this.isActive = true;
    this.description = '';
  }

  selectType(t: CategoryType): void {
    this.type = t;
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onNameBlur(): void {
    this.nameTouched = true;
  }

  get isNameInvalid(): boolean {
    return this.nameTouched && (!this.name || this.name.trim() === '');
  }

  get nameUppercaseLabel(): string {
    return this.name && this.name.trim() ? this.name.trim().toUpperCase() : 'THIÉBOUDIENNE';
  }

  onReplaceImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input && input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 3 * 1024 * 1024) {
        alert('Taille d image maximale dépassée (3 Mo max).');
        return;
      }
      this.fileName = file.name;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          this.imageUrl = e.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmitSave(): void {
    this.nameTouched = true;
    if (!this.name || this.name.trim() === '') {
      return;
    }

    this.isSaving = true;
    this.showToast('Enregistrement...');

    const parentCat = this.parentCategoryOptions.find(p => p.id === this.parentCategoryId);

    const categoryData: CatalogCategory = {
      id: this.catId || 'cat-' + Date.now(),
      codeId: this.catCodeId,
      name: this.name.trim(),
      type: this.type,
      parentCategoryId: this.parentCategoryId,
      parentCategoryName: parentCat ? parentCat.name : '',
      imageUrl: this.imageUrl,
      fileName: this.fileName,
      isActive: this.isActive,
      itemCount: this.editingCategory ? this.editingCategory.itemCount : 0,
      description: this.description
    };

    setTimeout(() => {
      this.saveCategory.emit(categoryData);
      this.isSaving = false;
      this.showToast('Catégorie enregistrée avec succès.');
      setTimeout(() => {
        this.onClose();
      }, 500);
    }, 400);
  }

  onConfirmDelete(): void {
    this.showDeleteConfirm = true;
  }

  onCancelDelete(): void {
    this.showDeleteConfirm = false;
  }

  onExecuteDelete(): void {
    if (this.catId) {
      this.deleteCategory.emit(this.catId);
      this.showDeleteConfirm = false;
      this.onClose();
    }
  }

  private showToast(msg: string): void {
    this.toastMessage = msg;
    setTimeout(() => {
      this.toastMessage = null;
    }, 2500);
  }
}
