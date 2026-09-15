export interface Category {
  id: string;
  name: string;
  icon?: string;
  imageUrl?: string;
  active?: boolean;
}

export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number; // in FCFA
  imageUrl: string;
  categoryId?: string;
  categoryName?: string;
  restaurantId: string;
  restaurantName: string;
  likesCount?: number;
  preparationTime?: string;
  tags?: string[];
}

export interface Restaurant {
  id: string;
  name: string;
  logoUrl: string;
  coverUrl: string;
  tagline?: string;
  description?: string;
  location: string;
  rating?: number;
  reviewsCount?: number;
  status: 'open' | 'closed';
  closingTime?: string;
  phoneNumber?: string;
  categories: Category[];
  dishes: Dish[];
  videosCount?: number;
  isFavorite?: boolean;
}

export interface FeedItem {
  id: string;
  restaurant: {
    id: string;
    name: string;
    avatarUrl: string;
    isVerified?: boolean;
  };
  dish: Dish;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  videoDuration?: string; // Max 3 minutes (e.g., '2:30')
  maxDurationSeconds?: number; // Default max 180s (3 min)
  likesCount: number;
  isLiked?: boolean;
  sharesCount: number;
  timeAgo?: string;
}

export interface CartItem {
  dish: Dish;
  quantity: number;
  selected?: boolean;
}

export interface Vendor {
  id: string;
  name: string;
  photoUrl: string;
  specialty: string;
  location: string;
  rating?: number;
  status: 'open' | 'closed';
  dishesCount?: number;
}

export interface SearchResult {
  restaurants: Restaurant[];
  dishes: Dish[];
  vendors: Vendor[];
  categories: Category[];
  recentSearches: string[];
}

export interface PaymentMethod {
  id: 'wave' | 'orange_money' | 'card' | 'cash';
  name: string;
  logoUrl: string;
  active: boolean;
  color?: string;
}

export interface DeliveryAddress {
  formattedAddress: string;
  name?: string;
  latitude: number;
  longitude: number;
  placeId: string;
  city?: string;
  country?: string;
}

export interface PlacePrediction {
  placeId: string;
  mainText: string;
  secondaryText: string;
  description: string;
}

export interface UserProfile {
  name: string;
  location: string;
  avatarUrl: string;
  notificationsEnabled: boolean;
}

export interface NotificationItem {
  id: string;
  type: 'order_ready' | 'message' | 'click_collect';
  restaurantName: string;
  restaurantAvatar?: string;
  orderRef?: string;
  statusText?: string;
  timeAgo: string;
  message: string;
  pickupLimit?: string;
  deliveryStatus?: string;
  hasQrCode?: boolean;
  hasReceipt?: boolean;
}

export interface OrderItemDetail {
  name: string;
  quantity: number;
  price: number;
}

export interface OrderHistoryItem {
  id: string;
  restaurantName: string;
  restaurantIconType?: 'food' | 'store';
  dateText: string;
  status: 'Livrée' | 'En cours' | 'Annulée';
  items: OrderItemDetail[];
  deliveryFee: number;
  totalPrice: number;
  paymentMethod?: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  subtitle: string;
  priceOffset: number;
  isRequired?: boolean;
}

export interface ProductOption {
  id: string;
  title: string;
  subtitle: string;
  priceOffset: number;
  isIncluded?: boolean;
}

export interface ProductSupplement {
  id: string;
  title: string;
  priceOffset: number;
}

export interface ProductDetail {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  images?: string[];
  stockInfo?: string;
  preparationTime?: string;
  restaurant: {
    id: string;
    name: string;
    subtitle: string;
    avatarUrl?: string;
    initials?: string;
  };
  variants: ProductVariant[];
  sauces: ProductOption[];
  supplements: ProductSupplement[];
}

export interface TrackingStep {
  label: string;
  completed: boolean;
  active: boolean;
}

export interface DriverInfo {
  name: string;
  badge: string;
  vehicle: string;
  rating: number;
  avatarUrl?: string;
  phone?: string;
}

export interface OrderTrackingData {
  id: string;
  orderRef: string;
  restaurant: {
    name: string;
    status: string;
    subtitle: string;
    address: string;
    avatarUrl?: string;
  };
  etaTime: string;
  etaRemainingMinutes: number;
  steps: TrackingStep[];
  metrics: {
    remainingTime: string;
    distance: string;
    condition: string;
  };
  driver: DriverInfo;
  items: OrderItemDetail[];
  totalPrice: number;
  deliveryAddress: {
    recipientName: string;
    addressText: string;
    instructions: string;
    tag: string;
  };
  securityCode: string;
}

export interface OrderValidationData {
  id: string;
  orderRef: string;
  priorityText: string;
  clientCode: string;
  qrCodeUrl?: string;
  readySinceTime: string;
  pickupLimitTime: string;
  timerRemainingMinutes: number;
  preparationStepCurrent: number;
  preparationStepTotal: number;
  steps: TrackingStep[];
  restaurant: {
    name: string;
    status: string;
    address: string;
    phone: string;
  };
  items: OrderItemDetail[];
  itemCount: number;
  bagNumber: string;
  paymentMethod: string;
  totalPrice: number;
}

export interface DeliveryTrackingState {
  latitude: number;
  longitude: number;
  speedKmH: number;
  distanceRemainingKm: number;
  estimatedTimeMin: number;
  estimatedArrival: string;
  trafficCondition: 'Fluide' | 'Modérée' | 'Dense';
  status: 'VALIDÉE' | 'EN_CUISINE' | 'EN_ROUTE' | 'LIVRÉE';
  progressPercentage: number;
}
