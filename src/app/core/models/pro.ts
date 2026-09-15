export type ProfessionalType = 'restaurant' | 'vendor' | 'RESTAURANT' | 'VENDEUR';

export interface ProfessionalProfile {
  id: string;
  type: ProfessionalType;
  name: string;
  avatarUrl: string;
  logoUrl?: string;
  coverUrl: string;
  tagline: string;
  description: string;
  location: string;
  address: string;
  phone: string;
  status: 'open' | 'closed';
  isOpen?: boolean;
  closingTime: string;
  cuisineTypes: string[];
  openingHours: string | {
    monThu: string;
    friSat: string;
    sun: string;
  };
  serviceModes?: {
    livraison: boolean;
    clickAndCollect: boolean;
    surPlace: boolean;
  };
}

export type ProProfile = ProfessionalProfile;

export type ProOrderStatus = 'EN_ATTENTE' | 'VALIDEE' | 'PREPARATION' | 'PRETE' | 'EN_LIVRAISON' | 'LIVREE' | 'ANNULEE' | 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled' | string;

export interface ProDishVariant {
  id: string;
  name: string;
  price?: number;
  extraPrice?: number;
  quantityAllocated?: number;
  formatTag?: string;
}

export interface ProDish {
  id: string;
  name: string;
  description: string;
  price: number;
  category?: string;
  categoryId?: string;
  categoryName?: string;
  imageUrl: string;
  isVisiblePublic: boolean;
  variants: ProDishVariant[];
  stockDailyLimit?: number;
}

export interface ProOrderItem {
  name: string;
  quantity: number;
  totalPrice: number;
  selectedVariants?: string[];
}

export interface ProOrder {
  id: string;
  orderRef: string;
  type?: 'pickup' | 'delivery' | string;
  serviceMode?: 'LIVRAISON' | 'CLICK_AND_COLLECT' | 'SUR_PLACE' | string;
  isUrgent?: boolean;
  status: ProOrderStatus;
  clientName: string;
  deliveryAddress?: string;
  timeAgo?: string;
  timeFormatted?: string;
  createdAt?: string;
  itemsText?: string;
  items?: ProOrderItem[];
  paymentMethodText?: string;
  paymentDotClass?: string;
  dateGroup?: string;
  totalPrice?: number;
  totalAmount?: number;
}

export interface ProStats {
  todayOrdersCount: number;
  todayRevenueFcfa: number;
  todayRevenue: number;
  pickupOrdersCount: number;
  urgentOrdersCount: number;
  weekRevenueFcfa: number;
  weeklyTotalRevenue: number;
  totalOrdersCount: number;
  weekOrdersCount: number;
  averageBasket: number;
  acceptanceRate: number;
  rating: number;
  weeklyRevenue: { day: string; amount: number }[];
  hourlyRevenue: { hour: string; amount: number }[];
  topDishes: { name: string; portionsSold: number; revenueFcfa: number; count?: number; revenue?: number }[];
  lowDemandDishes: { id: string; name: string; ordersCount: number; priceFcfa: number; count?: number }[];
}

export interface ProVideoUpload {
  id: string;
  videoUrl: string;
  dishId?: string;
  dishName?: string;
  priceFcfa?: number;
  category?: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  dishTag?: string;
  viewsCount?: number;
  viewsText?: string;
  likesCount?: number;
  durationSeconds?: number;
  publishedAt?: string;
  createdAt?: string;
  isVisiblePublic?: boolean;
}
