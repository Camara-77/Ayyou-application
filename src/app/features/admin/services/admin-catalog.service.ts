import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import {
  CatalogArticleItem,
  CatalogCategory,
  CatalogFilterTab,
  CatalogStatsSummary,
  ModerationStatus
} from '../models/admin-catalog.models';

@Injectable({
  providedIn: 'root'
})
export class AdminCatalogService {
  private mockCategories: CatalogCategory[] = [
    {
      id: 'cat-14',
      codeId: 'CAT-014',
      name: 'Thiéboudienne',
      type: 'Plat',
      subCategoryTag: 'PLAT • S-CATÉGORIE : RIZ',
      parentCategoryId: 'cat-1',
      parentCategoryName: 'Plats Traditionnels & Spécialités Locales',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&auto=format&fit=crop&q=80',
      fileName: 'thieb_rouge_dakar.jpg',
      isActive: true,
      itemCount: 142,
      linkedEstCount: 38,
      displayOrder: 1,
      description: 'Plat national sénégalais décliné au poisson rouge ou blanc'
    },
    {
      id: 'cat-3',
      codeId: 'CAT-003',
      name: 'Burgers',
      type: 'Plat',
      subCategoryTag: 'PLAT • CATÉGORIE PRINCIPALE',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=120&auto=format&fit=crop&q=80',
      fileName: 'burgers.jpg',
      isActive: true,
      itemCount: 89,
      linkedEstCount: 24,
      displayOrder: 2,
      description: 'Burgers gourmets, cheeseburgers et frites maison'
    },
    {
      id: 'cat-2',
      codeId: 'CAT-002',
      name: 'Braisés & Grillades',
      type: 'Restaurant',
      subCategoryTag: 'RESTAURANT & PLAT • PRINCIPALE',
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=120&auto=format&fit=crop&q=80',
      fileName: 'braises_locale.jpg',
      isActive: true,
      itemCount: 115,
      linkedEstCount: 42,
      displayOrder: 3,
      description: 'Poulet braisé, dibi d agneau et poisson grillé'
    },
    {
      id: 'cat-7',
      codeId: 'CAT-007',
      name: 'Cuisine Sénégalaisse',
      type: 'Restaurant',
      subCategoryTag: 'RESTAURANT • PRINCIPALE',
      imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=120&auto=format&fit=crop&q=80',
      fileName: 'cuisine_senegalaise.jpg',
      isActive: true,
      itemCount: 65,
      linkedEstCount: 65,
      displayOrder: 4,
      description: 'Spécialités culinaires sénégalaises et ouest-africaines'
    },
    {
      id: 'cat-4',
      codeId: 'CAT-004',
      name: 'Épicerie & Produits Locaux',
      type: 'Commerce',
      subCategoryTag: 'VENDEUR • PRINCIPALE',
      imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=120&auto=format&fit=crop&q=80',
      fileName: 'epicerie_primeurs.jpg',
      isActive: true,
      itemCount: 28,
      linkedEstCount: 28,
      displayOrder: 5,
      description: 'Fruits exotiques, légumes frais et épicerie fine'
    },
    {
      id: 'cat-6',
      codeId: 'CAT-006',
      name: 'Jus & Boissons Locales',
      type: 'Produit',
      subCategoryTag: 'PRODUIT • S-CATÉGORIE : BOISSONS',
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=120&auto=format&fit=crop&q=80',
      fileName: 'boissons.jpg',
      isActive: true,
      itemCount: 76,
      linkedEstCount: 18,
      displayOrder: 6,
      description: 'Jus de bissap, bouye, gingembre et rafraîchissements'
    },
    {
      id: 'cat-8',
      codeId: 'CAT-008',
      name: 'Fast-food & Street Food',
      type: 'Restaurant',
      subCategoryTag: 'RESTAURANT • PRINCIPALE',
      imageUrl: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=120&auto=format&fit=crop&q=80',
      fileName: 'fast_food.jpg',
      isActive: true,
      itemCount: 34,
      linkedEstCount: 34,
      displayOrder: 7,
      description: 'Sandwichs, tacos, paninis et restauration rapide'
    },
    {
      id: 'cat-9',
      codeId: 'CAT-009',
      name: 'Pâtisserie & Boulangerie',
      type: 'Commerce',
      subCategoryTag: 'VENDEUR • PRINCIPALE',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=120&auto=format&fit=crop&q=80',
      fileName: 'patisserie.jpg',
      isActive: true,
      itemCount: 19,
      linkedEstCount: 19,
      displayOrder: 8,
      description: 'Pains frais, viennoiseries et gâteaux d anniversaire'
    },
    {
      id: 'cat-10',
      codeId: 'CAT-010',
      name: 'Seafood & Poissons',
      type: 'Restaurant',
      subCategoryTag: 'RESTAURANT • PRINCIPALE',
      imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=120&auto=format&fit=crop&q=80',
      fileName: 'seafood.jpg',
      isActive: false,
      itemCount: 12,
      linkedEstCount: 12,
      displayOrder: 9,
      description: 'Temporairement masquée du feed client'
    }
  ];

  private mockArticles: CatalogArticleItem[] = [
    {
      id: 'art-001',
      sku: 'DKR-PLT-042',
      name: 'Thiéboudienne Rouge Penda Mbaye',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&auto=format&fit=crop&q=80',
      establishmentName: 'Chez Loutcha',
      establishmentDistrict: 'Plateau',
      partnerType: 'RESTAURANT',
      categoryName: 'Thiéboudienne',
      categoryId: 'cat-14',
      basePrice: 4500,
      priceFormatted: '4 500 FCFA',
      stockStatus: 'EN_STOCK',
      stockStatusLabel: 'En stock',
      stockStatusColor: 'green',
      stockTotal: 100,
      stockAyoo: 40,
      stockAvailable: 38,
      moderationStatus: 'VALIDE',
      moderationStatusLabel: 'Validé',
      moderationStatusColor: 'gray',
      description: 'Plat national sénégalais préparé au poisson thiof frais, riz rouge parfumé et légumes du marché.',
      variants: [
        { id: 'v-1', name: 'Portion Individuelle', price: 4500 },
        { id: 'v-2', name: 'Grand Plat Familial', price: 12000 }
      ]
    },
    {
      id: 'art-002',
      sku: 'DKR-PLT-043',
      name: 'Yassa au Poulet Braisé Fermier',
      imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=120&auto=format&fit=crop&q=80',
      establishmentName: 'Chez Loutcha',
      establishmentDistrict: 'Plateau',
      partnerType: 'RESTAURANT',
      categoryName: 'Braisés & Locale',
      categoryId: 'cat-2',
      basePrice: 3500,
      priceFormatted: '3 500 FCFA',
      stockStatus: 'EN_STOCK',
      stockStatusLabel: 'En stock',
      stockStatusColor: 'green',
      stockTotal: 80,
      stockAyoo: 30,
      stockAvailable: 26,
      moderationStatus: 'VALIDE',
      moderationStatusLabel: 'Validé',
      moderationStatusColor: 'gray',
      description: 'Poulet fermier mariné au citron vert et oignons confits au feu de bois.'
    },
    {
      id: 'art-003',
      sku: 'DKR-ALM-009',
      name: 'Burger Black Truffe Deluxe',
      subtitle: 'Nouveau format • Soumis il y a 2h',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=120&auto=format&fit=crop&q=80',
      establishmentName: 'Burger Black Bun',
      establishmentDistrict: 'Almadies',
      partnerType: 'RESTAURANT',
      categoryName: 'Burgers',
      categoryId: 'cat-3',
      basePrice: 6500,
      priceFormatted: '6 500 FCFA',
      stockStatus: 'EN_ATTENTE',
      stockStatusLabel: 'En attente',
      stockStatusColor: 'orange',
      stockTotal: 50,
      stockAyoo: 20,
      stockAvailable: 20,
      moderationStatus: 'A_MODERER',
      moderationStatusLabel: 'À Modérer',
      moderationStatusColor: 'red',
      isHighlightRow: true,
      description: 'Pain brioché noir au charbon végétal, steak de bœuf fumé, sauce truffe noire et cheddar affiné.',
      variants: [
        { id: 'v-3', name: 'Simple Beef', price: 6500 },
        { id: 'v-4', name: 'Double Bacon & Truffle', price: 8500 }
      ]
    },
    {
      id: 'art-004',
      sku: 'DKR-BIO-109',
      name: 'Panier Fruits Exotiques Bio',
      imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=120&auto=format&fit=crop&q=80',
      establishmentName: 'Touba Primeurs',
      establishmentDistrict: 'Mermoz',
      partnerType: 'VENDEUR',
      categoryName: 'Épicerie & Produits Locaux',
      categoryId: 'cat-4',
      basePrice: 8900,
      priceFormatted: '8 900 FCFA',
      stockStatus: 'EN_STOCK',
      stockStatusLabel: 'En stock',
      stockStatusColor: 'green',
      stockTotal: 40,
      stockAyoo: 15,
      stockAvailable: 14,
      moderationStatus: 'VALIDE',
      moderationStatusLabel: 'Validé',
      moderationStatusColor: 'gray',
      description: 'Assortiment de mangues, papayes, ananas et fruits de la passion issus des vergers régionaux.'
    },
    {
      id: 'art-005',
      sku: 'DKR-OUA-018',
      name: "Choukouya d'Agneau Feu de Bois",
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=120&auto=format&fit=crop&q=80',
      establishmentName: "L'Atelier du Choukouya",
      establishmentDistrict: 'Ouakam',
      partnerType: 'RESTAURANT',
      categoryName: 'Braisés & Grillades',
      categoryId: 'cat-2',
      basePrice: 5000,
      priceFormatted: '5 000 FCFA',
      stockStatus: 'RUPTURE',
      stockStatusLabel: 'Rupture',
      stockStatusColor: 'red',
      stockTotal: 0,
      stockAyoo: 0,
      stockAvailable: 0,
      moderationStatus: 'VALIDE',
      moderationStatusLabel: 'Validé',
      moderationStatusColor: 'gray',
      description: 'Morceaux d agneau marinés aux kankankan et grillés à feu doux.'
    },
    {
      id: 'art-006',
      sku: 'DKR-NGR-087',
      name: 'Dibi d\'Agneau Grillé Spécial Dakar',
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=120&auto=format&fit=crop&q=80',
      establishmentName: 'Chez Tantie Marie',
      establishmentDistrict: 'Ngor',
      partnerType: 'RESTAURANT',
      categoryName: 'Braisés & Grillades',
      categoryId: 'cat-2',
      basePrice: 5500,
      priceFormatted: '5 500 FCFA',
      stockStatus: 'EN_STOCK',
      stockStatusLabel: 'En stock',
      stockStatusColor: 'green',
      stockTotal: 60,
      stockAyoo: 25,
      stockAvailable: 22,
      moderationStatus: 'VALIDE',
      moderationStatusLabel: 'Validé',
      moderationStatusColor: 'gray',
      description: 'Dibi d agneau traditionnel servi dans du papier kraft avec oignons pimentés et moutarde douce.'
    },
    {
      id: 'art-007',
      sku: 'DKR-PLT-098',
      name: 'Jus de Bissap Royal Menthe 50cl',
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=120&auto=format&fit=crop&q=80',
      establishmentName: 'Chez Loutcha',
      establishmentDistrict: 'Plateau',
      partnerType: 'VENDEUR',
      categoryName: 'Jus & Boissons Locales',
      categoryId: 'cat-6',
      basePrice: 1500,
      priceFormatted: '1 500 FCFA',
      stockStatus: 'EN_STOCK',
      stockStatusLabel: 'En stock',
      stockStatusColor: 'green',
      stockTotal: 150,
      stockAyoo: 60,
      stockAvailable: 58,
      moderationStatus: 'VALIDE',
      moderationStatusLabel: 'Validé',
      moderationStatusColor: 'gray',
      description: 'Infusion de fleurs d hibiscus séchées avec feuilles de menthe fraîche et sucre de canne.'
    }
  ];

  private selectedArticleSubject = new BehaviorSubject<CatalogArticleItem | null>(this.mockArticles[2]);
  selectedArticle$ = this.selectedArticleSubject.asObservable();

  private categoriesSubject = new BehaviorSubject<CatalogCategory[]>(this.mockCategories);
  categories$ = this.categoriesSubject.asObservable();

  getStatsSummary(): Observable<CatalogStatsSummary> {
    return of({
      totalReferences: 4820,
      articlesAvailable: 4615,
      outOfStock: 205,
      moderationRequired: 18,
      averageDishPriceFcfa: 4250
    });
  }

  filterArticles(
    tab: CatalogFilterTab,
    search: string,
    category: string,
    establishment: string
  ): Observable<CatalogArticleItem[]> {
    let result = [...this.mockArticles];

    if (tab === 'ACTIVE') {
      result = result.filter(a => a.stockStatus === 'EN_STOCK' && a.moderationStatus === 'VALIDE');
    } else if (tab === 'PENDING_VALIDATION') {
      result = result.filter(a => a.moderationStatus === 'A_MODERER' || a.moderationStatus === 'A_CORRIGER');
    } else if (tab === 'OUT_OF_STOCK') {
      result = result.filter(a => a.stockStatus === 'RUPTURE' || a.stockStatus === 'EPUISE');
    } else if (tab === 'FLAGGED') {
      result = result.filter(a => a.moderationStatus === 'A_MODERER' || a.moderationStatus === 'A_CORRIGER' || a.moderationStatus === 'REFUSE');
    }

    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      result = result.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.sku.toLowerCase().includes(q) ||
        a.establishmentName.toLowerCase().includes(q) ||
        a.categoryName.toLowerCase().includes(q)
      );
    }

    if (category && category !== 'ALL') {
      result = result.filter(a => a.categoryId === category || a.categoryName === category);
    }

    if (establishment && establishment !== 'ALL') {
      result = result.filter(a => a.establishmentName === establishment);
    }

    return of(result);
  }

  filterCategories(
    typeTab: string,
    statusTab: string,
    search: string
  ): Observable<CatalogCategory[]> {
    let result = [...this.categoriesSubject.value];

    // Filter by Type Tab
    if (typeTab === 'RESTAURANTS') {
      result = result.filter(c => c.type === 'Restaurant');
    } else if (typeTab === 'VENDEURS') {
      result = result.filter(c => c.type === 'Commerce');
    } else if (typeTab === 'PLATS') {
      result = result.filter(c => c.type === 'Plat');
    } else if (typeTab === 'PRODUITS') {
      result = result.filter(c => c.type === 'Produit');
    }

    // Filter by Status Tab
    if (statusTab === 'ACTIVES') {
      result = result.filter(c => c.isActive === true);
    } else if (statusTab === 'DESACTIVESS') {
      result = result.filter(c => c.isActive === false);
    }

    // Filter by Search Query
    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.subCategoryTag && c.subCategoryTag.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q))
      );
    }

    return of(result);
  }

  selectArticle(article: CatalogArticleItem | null): void {
    this.selectedArticleSubject.next(article);
  }

  updateModerationStatus(articleId: string, status: ModerationStatus): void {
    const item = this.mockArticles.find(a => a.id === articleId);
    if (item) {
      item.moderationStatus = status;
      if (status === 'VALIDE') {
        item.moderationStatusLabel = 'Validé';
        item.moderationStatusColor = 'gray';
        item.isHighlightRow = false;
        item.stockStatus = 'EN_STOCK';
        item.stockStatusLabel = 'En stock';
        item.stockStatusColor = 'green';
      } else if (status === 'A_CORRIGER') {
        item.moderationStatusLabel = 'À Corriger';
        item.moderationStatusColor = 'orange';
      } else if (status === 'REFUSE') {
        item.moderationStatusLabel = 'Refusé';
        item.moderationStatusColor = 'red';
      }
      this.selectedArticleSubject.next({ ...item });
    }
  }

  updateStockAllocation(articleId: string, stockAyoo: number): void {
    const item = this.mockArticles.find(a => a.id === articleId);
    if (item) {
      item.stockAyoo = stockAyoo;
      item.stockAvailable = Math.min(item.stockAvailable, stockAyoo);
      this.selectedArticleSubject.next({ ...item });
    }
  }

  addCategory(category: CatalogCategory): void {
    const current = this.categoriesSubject.value;
    this.categoriesSubject.next([category, ...current]);
  }

  updateCategory(category: CatalogCategory): void {
    const current = this.categoriesSubject.value;
    const index = current.findIndex(c => c.id === category.id);
    if (index !== -1) {
      const updated = [...current];
      updated[index] = { ...category };
      this.categoriesSubject.next(updated);
    }
  }

  toggleCategoryStatus(categoryId: string): void {
    const current = this.categoriesSubject.value;
    const cat = current.find(c => c.id === categoryId);
    if (cat) {
      cat.isActive = !cat.isActive;
      this.categoriesSubject.next([...current]);
    }
  }

  deleteCategory(categoryId: string): void {
    const current = this.categoriesSubject.value;
    this.categoriesSubject.next(current.filter(c => c.id !== categoryId));
  }

  reorderCategories(categories: CatalogCategory[]): void {
    this.categoriesSubject.next([...categories]);
  }
}
