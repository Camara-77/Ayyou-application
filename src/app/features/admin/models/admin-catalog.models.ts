export type StockStatus = 'EN_STOCK' | 'EN_ATTENTE' | 'RUPTURE' | 'EPUISE';
export type ModerationStatus = 'VALIDE' | 'A_MODERER' | 'A_CORRIGER' | 'REFUSE';
export type PartnerType = 'RESTAURANT' | 'VENDEUR';
export type CatalogFilterTab = 'ALL' | 'ACTIVE' | 'PENDING_VALIDATION' | 'OUT_OF_STOCK' | 'FLAGGED';
export type CategoryType = 'Restaurant' | 'Commerce' | 'Plat' | 'Produit';

export interface CatalogVariant {
  id: string;
  name: string; // e.g. 'Simple', 'Double', 'Maxi'
  price: number;
}

export interface CatalogCustomizationOption {
  id: string;
  name: string; // e.g. 'Supplément Fromage', 'Sauce Piment'
  extraPrice: number;
}

export interface CatalogCategory {
  id: string;
  codeId?: string;                // e.g. 'CAT-014'
  name: string;
  type: CategoryType;             // 'Restaurant' | 'Commerce' | 'Plat' | 'Produit'
  parentCategoryId?: string;
  parentCategoryName?: string;
  imageUrl?: string;
  fileName?: string;
  isActive: boolean;
  itemCount: number;              // e.g. 142
  linkedEstCount?: number;        // e.g. 38 (restaurants or establishments linked)
  displayOrder?: number;          // e.g. 1, 2, 3
  description?: string;
  subCategoryTag?: string;        // e.g. 'S-CATÉGORIE : RIZ', 'PRINCIPALE'
}

export interface CatalogArticleItem {
  id: string;                      // 'art-001'
  sku: string;                     // 'DKR-PLT-042'
  name: string;                    // 'Thiéboudienne Rouge Penda Mbaye'
  subtitle?: string;               // 'Nouveau format • Soumis il y a 2h'
  imageUrl: string;                // thumbnail path/URL
  
  establishmentName: string;      // 'Chez Loutcha'
  establishmentDistrict: string;  // 'Plateau'
  partnerType: PartnerType;        // 'RESTAURANT'
  
  categoryName: string;           // 'Plats Traditionnels'
  categoryId: string;
  
  basePrice: number;              // 4500
  priceFormatted: string;         // '4 500 FCFA'
  
  stockStatus: StockStatus;
  stockStatusLabel: string;        // 'En stock', 'En attente', 'Rupture'
  stockStatusColor: 'green' | 'orange' | 'red';
  
  stockTotal: number;             // e.g. 100
  stockAyoo: number;              // e.g. 40 (Allocated to AYYOU)
  stockAvailable: number;         // e.g. 35
  
  moderationStatus: ModerationStatus;
  moderationStatusLabel: string;   // 'Validé', 'À Modérer', 'À Corriger'
  moderationStatusColor: 'gray' | 'red' | 'orange';
  
  isHighlightRow?: boolean;        // For 'Burger Black Truffe Deluxe'
  
  variants?: CatalogVariant[];
  options?: CatalogCustomizationOption[];
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CatalogStatsSummary {
  totalReferences: number;         // 4820
  articlesAvailable: number;       // 4615
  outOfStock: number;              // 205
  moderationRequired: number;      // 18
  averageDishPriceFcfa: number;    // 4250
}
