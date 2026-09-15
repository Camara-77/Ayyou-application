import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProHeaderComponent } from '../../components/pro-header/pro-header.component';
import { ProBottomNavComponent } from '../../components/pro-bottom-nav/pro-bottom-nav.component';
import { ProMenuService } from '../../../../core/services/pro-menu.service';
import { ProDish, ProDishVariant } from '../../../../core/models/pro';

@Component({
  selector: 'app-pro-menu-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProHeaderComponent, ProBottomNavComponent],
  templateUrl: './pro-menu-edit.component.html',
  styleUrls: ['./pro-menu-edit.component.scss']
})
export class ProMenuEditComponent implements OnInit {
  isEditMode: boolean = false;
  dishId: string | null = null;

  categories: string[] = ['Plats nationaux', 'Entrées', 'Desserts', 'Boissons'];
  selectedCategory: string = 'Plats nationaux';

  dish: ProDish = {
    id: '',
    name: 'Thiéboudienne Rouge Royale',
    description: 'Riz rouge parfumé accompagné de mérou frais, manioc, carottes et piment doux mijoté.',
    price: 4500,
    category: 'Plats nationaux',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    isVisiblePublic: true,
    variants: [
      {
        id: 'v1',
        name: 'Classique — 1 personne',
        price: 4500,
        quantityAllocated: 20,
        formatTag: 'Format individuel'
      },
      {
        id: 'v2',
        name: 'Gourmand XL',
        price: 6000,
        quantityAllocated: 10
      },
      {
        id: 'v3',
        name: 'Familiale — 3 à 4 personnes',
        price: 10000,
        quantityAllocated: 5
      }
    ]
  };

  constructor(
    private proMenuService: ProMenuService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.dishId = this.route.snapshot.paramMap.get('id');
    if (this.dishId) {
      const existing = this.proMenuService.getDishById(this.dishId);
      if (existing) {
        this.isEditMode = true;
        this.dish = JSON.parse(JSON.stringify(existing));
        if (this.dish.category) {
          this.selectedCategory = this.dish.category;
        }
      }
    }
  }

  selectCategory(cat: string): void {
    this.selectedCategory = cat;
    this.dish.category = cat;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.dish.imageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  addVariant(): void {
    if (!this.dish.variants) this.dish.variants = [];
    const count = this.dish.variants.length + 1;
    this.dish.variants.push({
      id: 'v_' + Date.now(),
      name: `Nouvelle variante ${count}`,
      price: 5000,
      quantityAllocated: 10
    });
  }

  removeVariant(index: number): void {
    if (this.dish.variants && this.dish.variants.length > 1) {
      this.dish.variants.splice(index, 1);
    }
  }

  saveDish(): void {
    if (!this.dish.name.trim()) return;

    this.dish.category = this.selectedCategory;
    if (this.dish.variants && this.dish.variants.length > 0) {
      this.dish.price = this.dish.variants[0].price || this.dish.price;
    }

    if (this.isEditMode) {
      this.proMenuService.updateDish(this.dish);
    } else {
      this.dish.id = 'd_' + Date.now();
      this.proMenuService.addDish(this.dish);
    }

    this.router.navigate(['/pro/profile']);
  }
}
