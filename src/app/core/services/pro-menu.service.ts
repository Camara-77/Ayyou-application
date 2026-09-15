import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ProDish } from '../models/pro';

@Injectable({
  providedIn: 'root'
})
export class ProMenuService {
  private initialDishes: ProDish[] = [
    {
      id: 'd1',
      name: 'Thiéboudienne Penda Mbaye',
      description: 'Riz au poisson rouge traditionnel préparé avec légumes frais, thiof et piment vert.',
      price: 4500,
      category: 'Plats Sénégalais',
      categoryId: 'nationaux',
      categoryName: 'Plats Nationaux',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      isVisiblePublic: true,
      stockDailyLimit: 15,
      variants: [
        { id: 'v1', name: 'Classique — 1 personne', extraPrice: 0, price: 4500, quantityAllocated: 20 },
        { id: 'v2', name: 'Gourmand XL', extraPrice: 1500, price: 6000, quantityAllocated: 10 },
        { id: 'v3', name: 'Familiale — 3 à 4 personnes', extraPrice: 5500, price: 10000, quantityAllocated: 5 }
      ]
    },
    {
      id: 'd2',
      name: 'Yassa Poulet Gourmet',
      description: 'Poulet mariné grillé au feu de bois avec sauce oignons caramélisés et moutarde à l’ancienne.',
      price: 3500,
      category: 'Plats Sénégalais',
      categoryId: 'nationaux',
      categoryName: 'Plats Nationaux',
      imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80',
      isVisiblePublic: false,
      variants: [
        { id: 'v1', name: 'Portion Standard', extraPrice: 0, price: 3500, quantityAllocated: 15 }
      ]
    },
    {
      id: 'd3',
      name: 'Pastels au Thon & Crevettes',
      description: 'Beignets farcis accompagnés de sauce tomate épicée-sucre et oignons confits.',
      price: 2500,
      category: 'Desserts & Douceurs',
      categoryId: 'entrees',
      categoryName: 'Entrées',
      imageUrl: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80',
      isVisiblePublic: true,
      variants: [
        { id: 'v1', name: 'Portion 6 pcs', extraPrice: 0, price: 2500, quantityAllocated: 30 }
      ]
    }
  ];

  private dishesSubject = new BehaviorSubject<ProDish[]>(this.initialDishes);
  dishes$: Observable<ProDish[]> = this.dishesSubject.asObservable();

  private isPublicVisibleSubject = new BehaviorSubject<boolean>(true);
  isPublicVisible$: Observable<boolean> = this.isPublicVisibleSubject.asObservable();

  get dishes(): ProDish[] {
    return this.dishesSubject.value;
  }

  togglePublicMenu(): void {
    this.isPublicVisibleSubject.next(!this.isPublicVisibleSubject.value);
  }

  getDishById(id: string): ProDish | undefined {
    return this.dishesSubject.value.find(d => d.id === id);
  }

  getDish(id: string): Observable<ProDish | undefined> {
    return of(this.getDishById(id));
  }

  toggleDishVisibility(id: string): void {
    const current = [...this.dishesSubject.value];
    const index = current.findIndex(d => d.id === id);
    if (index > -1) {
      current[index] = {
        ...current[index],
        isVisiblePublic: !current[index].isVisiblePublic
      };
      this.dishesSubject.next(current);
    }
  }

  toggleVisibility(id: string): void {
    this.toggleDishVisibility(id);
  }

  addDish(dish: ProDish): void {
    const current = [dish, ...this.dishesSubject.value];
    this.dishesSubject.next(current);
  }

  updateDish(dish: ProDish): void {
    const current = [...this.dishesSubject.value];
    const index = current.findIndex(d => d.id === dish.id);
    if (index > -1) {
      current[index] = { ...dish };
      this.dishesSubject.next(current);
    }
  }

  saveDish(dish: Partial<ProDish>): Observable<ProDish> {
    if (dish.id) {
      this.updateDish(dish as ProDish);
      return of(dish as ProDish);
    } else {
      const newD: ProDish = {
        id: 'd_' + Date.now(),
        name: dish.name || 'Nouveau Plat',
        description: dish.description || '',
        price: dish.price || 4000,
        imageUrl: dish.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        isVisiblePublic: true,
        variants: []
      };
      this.addDish(newD);
      return of(newD);
    }
  }

  deleteDish(id: string): void {
    const current = this.dishesSubject.value.filter(d => d.id !== id);
    this.dishesSubject.next(current);
  }
}
