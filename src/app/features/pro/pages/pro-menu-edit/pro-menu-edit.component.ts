import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProHeaderComponent } from '../../components/pro-header/pro-header.component';
import { ProBottomNavComponent } from '../../components/pro-bottom-nav/pro-bottom-nav.component';
import { ProSubscriptionBannerComponent } from '../../components/pro-subscription-banner/pro-subscription-banner.component';
import { ProMenuService } from '../../../../core/services/pro-menu.service';
import { ProfessionalService } from '../../../../core/services/professional.service';
import { ProDish, ProDishVariant } from '../../../../core/models/pro';
import { MainCategory, CATEGORIES_HIERARCHY, getCategoryByName } from '../../../../core/constants/taxonomy';

@Component({
  selector: 'app-pro-menu-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProHeaderComponent, ProBottomNavComponent, ProSubscriptionBannerComponent],
  templateUrl: './pro-menu-edit.component.html',
  styleUrls: ['./pro-menu-edit.component.scss']
})

export class ProMenuEditComponent implements OnInit {
  private proMenuService = inject(ProMenuService);
  private professionalService = inject(ProfessionalService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode: boolean = false;
  dishId: string | null = null;
  isSubmitting: boolean = false;
  errorMessage: string = '';

  categoriesHierarchy: MainCategory[] = CATEGORIES_HIERARCHY;
  selectedMainCategory: MainCategory = CATEGORIES_HIERARCHY[0];
  selectedSubCategory: string = CATEGORIES_HIERARCHY[0].subCategories[0] || '';
  categories: string[] = CATEGORIES_HIERARCHY.map(c => c.name);
  backendCategories: any[] = [];
  selectedCategory: string = CATEGORIES_HIERARCHY[0].name;

  dish: ProDish = {
    id: '',
    name: 'Thiéboudienne Rouge Royale',
    description: 'Riz rouge parfumé accompagné de mérou frais, manioc, carottes et piment doux mijoté.',
    price: 4500,
    category: CATEGORIES_HIERARCHY[0].name,
    subCategory: CATEGORIES_HIERARCHY[0].subCategories[0],
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    isVisiblePublic: true,
    stockGeneral: 100,
    stockAyyouAllocated: 50,
    variants: [
      {
        id: 'v1',
        name: 'Classique — 1 personne',
        price: 4500,
        extraPrice: 0,
        quantityAllocated: 20,
        formatTag: 'Format individuel'
      }
    ]
  };

  ngOnInit(): void {
    // Charger les catégories réelles depuis le backend Django
    this.professionalService.getCategories().subscribe({
      next: (cats) => {
        if (cats && cats.length > 0) {
          this.backendCategories = cats;
          this.syncCategoryId();
        }
      },
      error: () => {}
    });

    this.dishId = this.route.snapshot.paramMap.get('id');
    if (this.dishId) {
      this.proMenuService.getDish(this.dishId).subscribe({
        next: (existing) => {
          if (existing) {
            this.isEditMode = true;
            this.dish = JSON.parse(JSON.stringify(existing));
            
            // Sync category hierarchy
            if (this.dish.category) {
              const matchedMain = getCategoryByName(this.dish.category);
              if (matchedMain) {
                this.selectedMainCategory = matchedMain;
                this.selectedCategory = matchedMain.name;
              }
            }
            if (this.dish.subCategory && this.selectedMainCategory.subCategories.includes(this.dish.subCategory)) {
              this.selectedSubCategory = this.dish.subCategory;
            } else if (this.selectedMainCategory.subCategories.length > 0) {
              this.selectedSubCategory = this.selectedMainCategory.subCategories[0];
            }
            this.syncCategoryId();
          }
        },
        error: () => {}
      });
    } else {
      this.isEditMode = false;
      this.dish = {
        id: '',
        name: '',
        description: '',
        price: 4500,
        category: this.selectedMainCategory.name,
        subCategory: this.selectedSubCategory,
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        isVisiblePublic: true,
        stockGeneral: 100,
        stockAyyouAllocated: 50,
        variants: [
          {
            id: 'v_1',
            name: 'Classique — 1 personne',
            price: 4500,
            extraPrice: 0,
            quantityAllocated: 20,
            formatTag: 'Format individuel'
          }
        ]
      };
      this.syncCategoryId();
    }
  }

  syncCategoryId(): void {
    if (!this.backendCategories || this.backendCategories.length === 0) return;
    const currentCategoryName = this.selectedMainCategory.name;
    const found = this.backendCategories.find(c =>
      c.nom.toLowerCase() === currentCategoryName.toLowerCase() ||
      c.slug.toLowerCase() === currentCategoryName.toLowerCase()
    );
    if (found) {
      this.dish.categoryId = found.id.toString();
    } else if (this.backendCategories.length > 0) {
      this.dish.categoryId = this.backendCategories[0].id.toString();
    }
  }

  selectMainCategory(mainCat: MainCategory): void {
    this.selectedMainCategory = mainCat;
    this.selectedCategory = mainCat.name;
    this.dish.category = mainCat.name;
    if (mainCat.subCategories && mainCat.subCategories.length > 0) {
      this.selectedSubCategory = mainCat.subCategories[0];
      this.dish.subCategory = this.selectedSubCategory;
    } else {
      this.selectedSubCategory = '';
      this.dish.subCategory = '';
    }
    this.syncCategoryId();
  }

  selectSubCategory(subCat: string): void {
    this.selectedSubCategory = subCat;
    this.dish.subCategory = subCat;
  }

  selectCategory(cat: string): void {
    const matched = getCategoryByName(cat);
    if (matched) {
      this.selectMainCategory(matched);
    }
  }

  selectedImageFile: File | null = null;
  isUploadingImage: boolean = false;
  imageUploadError: string = '';

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedImageFile = file;
      this.isUploadingImage = true;
      this.imageUploadError = '';
      this.errorMessage = '';

      // Aperçu instantané local
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.dish.imageUrl = e.target.result;
      };
      reader.readAsDataURL(file);

      // Envoi réel vers le backend / Cloudinary
      this.professionalService.uploadProductImage(file).subscribe({
        next: (res) => {
          this.isUploadingImage = false;
          if (res?.image_url) {
            this.dish.imageUrl = res.image_url;
          }
        },
        error: (err) => {
          this.isUploadingImage = false;
          this.imageUploadError = err?.error?.detail || "Échec du téléversement de l'image sur Cloudinary.";
        }
      });
    }
  }

  addVariant(): void {
    if (!this.dish.variants) this.dish.variants = [];
    const count = this.dish.variants.length + 1;
    this.dish.variants.push({
      id: 'v_' + Date.now(),
      name: `Nouvelle variante ${count}`,
      price: 5000,
      extraPrice: 500,
      quantityAllocated: 10
    });
  }

  removeVariant(index: number): void {
    if (this.dish.variants && this.dish.variants.length > 1) {
      this.dish.variants.splice(index, 1);
    }
  }

  saveDish(): void {
    if (this.isSubmitting || this.isUploadingImage) return;

    if (!this.dish.name || !this.dish.name.trim()) {
      this.errorMessage = 'Le nom du plat est obligatoire.';
      return;
    }

    this.errorMessage = '';
    this.isSubmitting = true;

    this.dish.category = this.selectedMainCategory.name;
    this.dish.subCategory = this.selectedSubCategory;
    this.syncCategoryId();

    if (this.dish.variants && this.dish.variants.length > 0) {
      this.dish.price = this.dish.variants[0].price || this.dish.price;
    }

    this.proMenuService.saveDish(this.dish).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/pro/profile']);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Erreur lors de la sauvegarde du plat:', err);

        if (err?.error?.detail) {
          this.errorMessage = err.error.detail;
        } else if (err?.error && typeof err.error === 'object') {
          const keys = Object.keys(err.error);
          if (keys.length > 0) {
            const firstKey = keys[0];
            const val = err.error[firstKey];
            const msg = Array.isArray(val) ? val.join(', ') : val;
            this.errorMessage = `${firstKey}: ${msg}`;
          } else {
            this.errorMessage = "Impossible d'enregistrer le plat. Veuillez vérifier les informations et réessayer.";
          }
        } else {
          this.errorMessage = "Une erreur serveur ou réseau s'est produite lors de l'enregistrement du plat.";
        }
      }
    });
  }
}
