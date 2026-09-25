import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap, map, catchError } from 'rxjs';
import { ProDish, ProDishVariant } from '../models/pro';
import { ProfessionalService, BackendProduit } from './professional.service';

@Injectable({
  providedIn: 'root'
})
export class ProMenuService {
  private professionalService = inject(ProfessionalService);

  private dishesSubject = new BehaviorSubject<ProDish[]>([]);
  dishes$: Observable<ProDish[]> = this.dishesSubject.asObservable();

  private isPublicVisibleSubject = new BehaviorSubject<boolean>(true);
  isPublicVisible$: Observable<boolean> = this.isPublicVisibleSubject.asObservable();

  constructor() {
    this.loadBackendProducts();
  }

  get dishes(): ProDish[] {
    return this.dishesSubject.value;
  }

  loadBackendProducts(etabId?: number): Observable<ProDish[]> {
    return this.professionalService.getProducts(etabId).pipe(
      map(prods => prods.map(p => this.mapBackendToProDish(p))),
      tap(dishes => this.dishesSubject.next(dishes)),
      catchError(() => of(this.dishesSubject.value))
    );
  }

  mapBackendToProDish(prod: BackendProduit): ProDish {
    const catIdStr = prod.categorie ? (typeof prod.categorie === 'object' ? (prod.categorie as any).id.toString() : prod.categorie.toString()) : 'nationaux';
    return {
      id: prod.id.toString(),
      name: prod.nom,
      description: prod.description || '',
      price: typeof prod.prix_base === 'string' ? parseFloat(prod.prix_base) : prod.prix_base,
      category: prod.categorie_nom || 'Plats Nationaux',
      categoryId: catIdStr,
      categoryName: prod.categorie_nom || 'Plats Nationaux',
      imageUrl: prod.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      isVisiblePublic: prod.est_disponible,
      stockDailyLimit: prod.stock_ayyou_reserve ?? 50,
      stockGeneral: prod.stock_disponible ?? 100,
      stockAyyouAllocated: prod.stock_ayyou_reserve ?? 50,
      variants: Array.isArray(prod.variantes) ? prod.variantes.map(v => ({
        id: v.id ? v.id.toString() : 'v_' + Math.random(),
        name: v.titre,
        extraPrice: typeof v.surcout_prix === 'string' ? parseFloat(v.surcout_prix) : v.surcout_prix,
        price: (typeof prod.prix_base === 'string' ? parseFloat(prod.prix_base) : prod.prix_base) + (typeof v.surcout_prix === 'string' ? parseFloat(v.surcout_prix) : v.surcout_prix),
        quantityAllocated: prod.stock_ayyou_reserve ?? 50
      })) : []
    };
  }

  togglePublicMenu(): void {
    this.isPublicVisibleSubject.next(!this.isPublicVisibleSubject.value);
  }

  getDishById(id: string): ProDish | undefined {
    return this.dishesSubject.value.find(d => d.id === id);
  }

  getDish(id: string): Observable<ProDish | undefined> {
    const existing = this.getDishById(id);
    if (existing) {
      return of(existing);
    }
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      return of(undefined);
    }
    return this.professionalService.getProductById(numId).pipe(
      map(p => this.mapBackendToProDish(p))
    );
  }

  toggleDishVisibility(id: string): void {
    const numId = parseInt(id, 10);
    if (!isNaN(numId)) {
      this.professionalService.toggleProductDisponibilite(numId).subscribe({
        next: (res) => {
          const current = [...this.dishesSubject.value];
          const index = current.findIndex(d => d.id === id);
          if (index > -1) {
            current[index] = {
              ...current[index],
              isVisiblePublic: res.est_disponible
            };
            this.dishesSubject.next(current);
          }
        },
        error: () => {}
      });
    } else {
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
    } else {
      current.unshift({ ...dish });
    }
    this.dishesSubject.next(current);
  }

  saveDish(dish: Partial<ProDish>): Observable<ProDish> {
    const numId = dish.id ? parseInt(dish.id, 10) : undefined;
    const catIdNum = dish.categoryId ? parseInt(dish.categoryId, 10) : undefined;
    const payload: Partial<BackendProduit> = {
      id: isNaN(numId as number) ? undefined : numId,
      nom: dish.name || 'Nouveau Plat',
      description: dish.description || '',
      prix_base: dish.price || 4000,
      categorie: isNaN(catIdNum as number) ? undefined : catIdNum,
      image_url: dish.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      est_disponible: dish.isVisiblePublic !== undefined ? dish.isVisiblePublic : true,
      stock_disponible: dish.stockGeneral !== undefined ? dish.stockGeneral : 100,
      stock_ayyou_reserve: dish.stockAyyouAllocated !== undefined ? dish.stockAyyouAllocated : 50,
      variantes: dish.variants ? dish.variants.map(v => ({
        id: (v.id && !v.id.startsWith('v_')) ? parseInt(v.id, 10) : undefined,
        titre: v.name,
        surcout_prix: v.extraPrice || 0
      })) : []
    };

    return this.professionalService.saveProduct(payload).pipe(
      map(res => {
        const savedDish = this.mapBackendToProDish(res);
        if (dish.id) {
          this.updateDish(savedDish);
        } else {
          this.addDish(savedDish);
        }
        return savedDish;
      })
    );
  }

  deleteDish(id: string): void {
    const numId = parseInt(id, 10);
    if (!isNaN(numId)) {
      this.professionalService.deleteProduct(numId).subscribe({
        next: () => {
          const current = this.dishesSubject.value.filter(d => d.id !== id);
          this.dishesSubject.next(current);
        },
        error: () => {
          const current = this.dishesSubject.value.filter(d => d.id !== id);
          this.dishesSubject.next(current);
        }
      });
    } else {
      const current = this.dishesSubject.value.filter(d => d.id !== id);
      this.dishesSubject.next(current);
    }
  }
}
