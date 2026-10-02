import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CatalogArticleItem,
  CatalogCategory,
  CatalogFilterTab,
  CatalogStatsSummary,
  ModerationStatus
} from '../models/admin-catalog.models';
import { environment } from '../../../../environments/environment';

function mapBackendProductToCatalogArticleItem(p: any): CatalogArticleItem {
  const isAvailable = !!p.est_disponible;
  const stockTotal = Number(p.stock_disponible || 0);
  const stockAyoo = Number(p.stock_ayyou_reserve || 0);
  const stockAvailable = Math.min(stockTotal, stockAyoo);

  let stockStatus: 'EN_STOCK' | 'EN_ATTENTE' | 'RUPTURE' | 'EPUISE' = 'EN_STOCK';
  let stockStatusLabel = 'En stock';
  let stockStatusColor: 'green' | 'orange' | 'red' = 'green';

  if (stockTotal <= 0) {
    stockStatus = 'RUPTURE';
    stockStatusLabel = 'Rupture';
    stockStatusColor = 'red';
  } else if (!isAvailable) {
    stockStatus = 'EN_ATTENTE';
    stockStatusLabel = 'En attente';
    stockStatusColor = 'orange';
  }

  let moderationStatus: ModerationStatus = isAvailable ? 'VALIDE' : 'A_MODERER';
  let moderationStatusLabel = isAvailable ? 'Validé' : 'À Modérer';
  let moderationStatusColor: 'gray' | 'red' | 'orange' = isAvailable ? 'gray' : 'red';

  const basePrice = Number(p.prix_base || 0);
  const priceFormatted = `${new Intl.NumberFormat('fr-FR').format(basePrice)} FCFA`;
  const sku = p.id ? `DKR-PLT-${String(p.id).padStart(3, '0')}` : 'DKR-PLT-000';

  return {
    id: p.id ? p.id.toString() : '',
    sku,
    name: p.nom || 'Produit sans nom',
    subtitle: p.temps_preparation ? `Temps prépa: ${p.temps_preparation}` : undefined,
    imageUrl: p.image_url || p.image || '',
    establishmentName: p.etablissement_nom || p.vendeur_nom || 'Établissement',
    establishmentDistrict: 'Dakar',
    partnerType: 'RESTAURANT',
    categoryName: p.categorie_nom || 'Général',
    categoryId: p.categorie ? p.categorie.toString() : '',
    basePrice,
    priceFormatted,
    stockStatus,
    stockStatusLabel,
    stockStatusColor,
    stockTotal,
    stockAyoo,
    stockAvailable,
    moderationStatus,
    moderationStatusLabel,
    moderationStatusColor,
    description: p.description || ''
  };
}

function mapBackendCategoryToCatalogCategory(c: any): CatalogCategory {
  return {
    id: c.id ? c.id.toString() : '',
    codeId: c.slug ? c.slug.toUpperCase() : `CAT-${String(c.id || 1).padStart(3, '0')}`,
    name: c.nom || 'Catégorie',
    type: 'Plat',
    subCategoryTag: 'CATÉGORIE PRINCIPALE',
    imageUrl: c.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&auto=format&fit=crop&q=80',
    fileName: 'category.jpg',
    isActive: !!c.est_active,
    itemCount: Number(c.nombre_produits || 0),
    linkedEstCount: Number(c.nombre_etablissements || c.nombre_produits || 0),
    displayOrder: Number(c.ordre || 0),
    description: c.nom
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminCatalogService {
  private http = inject(HttpClient);

  private selectedArticleSubject = new BehaviorSubject<CatalogArticleItem | null>(null);
  selectedArticle$ = this.selectedArticleSubject.asObservable();

  private articlesSubject = new BehaviorSubject<CatalogArticleItem[]>([]);
  articles$ = this.articlesSubject.asObservable();

  private categoriesSubject = new BehaviorSubject<CatalogCategory[]>([]);
  categories$ = this.categoriesSubject.asObservable();

  getStatsSummary(): Observable<CatalogStatsSummary> {
    const url = `${environment.apiUrl}/api/admin/catalog/products/`;
    return this.http.get<any>(url).pipe(
      map(res => {
        const rawItems: any[] = Array.isArray(res) ? res : (res.results || []);
        const items = rawItems.map(mapBackendProductToCatalogArticleItem);

        const totalReferences = items.length;
        const articlesAvailable = items.filter(a => a.stockStatus === 'EN_STOCK' && a.moderationStatus === 'VALIDE').length;
        const outOfStock = items.filter(a => a.stockStatus === 'RUPTURE').length;
        const moderationRequired = items.filter(a => a.moderationStatus === 'A_MODERER').length;
        const sumPrices = items.reduce((acc, a) => acc + a.basePrice, 0);
        const averageDishPriceFcfa = totalReferences > 0 ? Math.round(sumPrices / totalReferences) : 0;

        return {
          totalReferences,
          articlesAvailable,
          outOfStock,
          moderationRequired,
          averageDishPriceFcfa
        };
      }),
      catchError(() => of({
        totalReferences: 0,
        articlesAvailable: 0,
        outOfStock: 0,
        moderationRequired: 0,
        averageDishPriceFcfa: 0
      }))
    );
  }

  filterArticles(
    tab: CatalogFilterTab,
    search: string,
    category: string,
    establishment: string
  ): Observable<CatalogArticleItem[]> {
    let params = new HttpParams();

    if (search && search.trim() !== '') {
      params = params.set('search', search.trim());
    }

    if (category && category !== 'ALL') {
      params = params.set('categorie', category);
    }

    if (establishment && establishment !== 'ALL') {
      params = params.set('etablissement', establishment);
    }

    const url = `${environment.apiUrl}/api/admin/catalog/products/`;

    return this.http.get<any>(url, { params }).pipe(
      map(res => {
        const rawItems: any[] = Array.isArray(res) ? res : (res.results || []);
        let items = rawItems.map(mapBackendProductToCatalogArticleItem);

        if (tab === 'ACTIVE') {
          items = items.filter(a => a.stockStatus === 'EN_STOCK' && a.moderationStatus === 'VALIDE');
        } else if (tab === 'PENDING_VALIDATION') {
          items = items.filter(a => a.moderationStatus === 'A_MODERER' || a.moderationStatus === 'A_CORRIGER');
        } else if (tab === 'OUT_OF_STOCK') {
          items = items.filter(a => a.stockStatus === 'RUPTURE' || a.stockStatus === 'EPUISE');
        } else if (tab === 'FLAGGED') {
          items = items.filter(a => a.moderationStatus === 'A_MODERER' || a.moderationStatus === 'A_CORRIGER' || a.moderationStatus === 'REFUSE');
        }

        this.articlesSubject.next(items);

        const currentSelected = this.selectedArticleSubject.getValue();
        if (items.length > 0) {
          if (!currentSelected || !items.some(a => a.id === currentSelected.id)) {
            this.selectedArticleSubject.next(items[0]);
          }
        } else {
          this.selectedArticleSubject.next(null);
        }

        return items;
      }),
      catchError(err => {
        console.error('Erreur chargement articles catalog:', err);
        return of([]);
      })
    );
  }

  filterCategories(
    typeTab: string,
    statusTab: string,
    search: string
  ): Observable<CatalogCategory[]> {
    const url = `${environment.apiUrl}/api/admin/catalog/categories/`;

    return this.http.get<any>(url).pipe(
      map(res => {
        const rawItems: any[] = Array.isArray(res) ? res : (res.results || []);
        let items = rawItems.map(mapBackendCategoryToCatalogCategory);

        if (statusTab === 'ACTIVES') {
          items = items.filter(c => c.isActive === true);
        } else if (statusTab === 'DESACTIVESS') {
          items = items.filter(c => c.isActive === false);
        }

        if (search && search.trim() !== '') {
          const q = search.toLowerCase().trim();
          items = items.filter(c => c.name.toLowerCase().includes(q) || (c.codeId && c.codeId.toLowerCase().includes(q)));
        }

        this.categoriesSubject.next(items);
        return items;
      }),
      catchError(err => {
        console.error('Erreur chargement catégories catalog:', err);
        return of([]);
      })
    );
  }

  selectArticle(article: CatalogArticleItem | null): void {
    this.selectedArticleSubject.next(article);
  }

  updateModerationStatus(articleId: string, status: ModerationStatus): Observable<CatalogArticleItem | null> {
    const url = `${environment.apiUrl}/api/admin/catalog/products/${articleId}/moderate/`;
    const est_disponible = status === 'VALIDE';

    return this.http.patch<any>(url, { est_disponible }).pipe(
      map(raw => {
        const updated = mapBackendProductToCatalogArticleItem(raw);
        const currentArticles = this.articlesSubject.getValue().map(a => a.id === articleId ? updated : a);
        this.articlesSubject.next(currentArticles);

        if (this.selectedArticleSubject.getValue()?.id === articleId) {
          this.selectedArticleSubject.next(updated);
        }
        return updated;
      }),
      catchError(err => {
        console.error('Erreur modération produit:', err);
        return of(null);
      })
    );
  }

  updateStockAllocation(articleId: string, stockAyoo: number): Observable<CatalogArticleItem | null> {
    const url = `${environment.apiUrl}/api/admin/catalog/products/${articleId}/moderate/`;

    return this.http.patch<any>(url, { stock_ayyou_reserve: stockAyoo }).pipe(
      map(raw => {
        const updated = mapBackendProductToCatalogArticleItem(raw);
        const currentArticles = this.articlesSubject.getValue().map(a => a.id === articleId ? updated : a);
        this.articlesSubject.next(currentArticles);

        if (this.selectedArticleSubject.getValue()?.id === articleId) {
          this.selectedArticleSubject.next(updated);
        }
        return updated;
      }),
      catchError(err => {
        console.error('Erreur réservation stock AYYOU:', err);
        return of(null);
      })
    );
  }

  addCategory(category: CatalogCategory): Observable<CatalogCategory | null> {
    const url = `${environment.apiUrl}/api/admin/catalog/categories/`;
    const body = {
      nom: category.name,
      est_active: category.isActive !== undefined ? category.isActive : true,
      ordre: category.displayOrder || 0,
      image_url: category.imageUrl || null
    };

    return this.http.post<any>(url, body).pipe(
      map(raw => {
        const created = mapBackendCategoryToCatalogCategory(raw);
        const current = this.categoriesSubject.getValue();
        this.categoriesSubject.next([created, ...current]);
        return created;
      }),
      catchError(err => {
        console.error('Erreur création catégorie:', err);
        return of(null);
      })
    );
  }

  updateCategory(category: CatalogCategory): Observable<CatalogCategory | null> {
    const url = `${environment.apiUrl}/api/admin/catalog/categories/${category.id}/`;
    const body = {
      nom: category.name,
      est_active: category.isActive,
      ordre: category.displayOrder,
      image_url: category.imageUrl
    };

    return this.http.patch<any>(url, body).pipe(
      map(raw => {
        const updated = mapBackendCategoryToCatalogCategory(raw);
        const current = this.categoriesSubject.getValue();
        const idx = current.findIndex(c => c.id === category.id);
        if (idx !== -1) {
          const newCategories = [...current];
          newCategories[idx] = updated;
          this.categoriesSubject.next(newCategories);
        }
        return updated;
      }),
      catchError(err => {
        console.error('Erreur modification catégorie:', err);
        return of(null);
      })
    );
  }

  toggleCategoryStatus(categoryId: string): Observable<CatalogCategory | null> {
    const currentCat = this.categoriesSubject.getValue().find(c => c.id === categoryId);
    if (!currentCat) return of(null);

    return this.updateCategory({
      ...currentCat,
      isActive: !currentCat.isActive
    });
  }

  deleteCategory(categoryId: string): Observable<boolean> {
    const url = `${environment.apiUrl}/api/admin/catalog/categories/${categoryId}/`;
    return this.http.delete<void>(url).pipe(
      map(() => {
        const current = this.categoriesSubject.getValue();
        this.categoriesSubject.next(current.filter(c => c.id !== categoryId));
        return true;
      }),
      catchError(err => {
        console.error('Erreur suppression catégorie:', err);
        return of(false);
      })
    );
  }

  reorderCategories(categories: CatalogCategory[]): Observable<boolean> {
    const url = `${environment.apiUrl}/api/admin/catalog/categories/reorder/`;
    const orders = categories.map((c, idx) => ({
      id: Number(c.id),
      ordre: idx + 1
    }));

    return this.http.post<any>(url, { orders }).pipe(
      map(() => {
        this.categoriesSubject.next([...categories]);
        return true;
      }),
      catchError(err => {
        console.error('Erreur réordonnancement catégories:', err);
        return of(false);
      })
    );
  }
}
