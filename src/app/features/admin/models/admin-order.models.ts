export type OrderStatus =
  | 'A_PREPARER'
  | 'EN_PREPARATION'
  | 'PRETE'
  | 'EN_LIVRAISON'
  | 'LIVREE'
  | 'ANNULEE'
  | 'LITIGE';

export type PaymentMethod = 'WAVE' | 'ORANGE_MONEY' | 'CASH' | 'CARTE_BANCAIRE';
export type PaymentStatus = 'PAYE' | 'EN_ATTENTE' | 'ECHOUE' | 'REMBOURSE';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  description?: string;
  priceFormatted: string;
  priceAmount: number;
}

export interface SubOrder {
  id: string;
  establishmentName: string;
  establishmentTypeLabel: string; // e.g. 'RESTAURATEUR'
  address: string;
  phone: string;
  items: OrderItem[];
  subtotalFormatted: string;
}

export interface OrderPayment {
  id: string;
  method: PaymentMethod;
  methodLabel: string; // e.g. 'Wave', 'Orange Money'
  reference: string; // e.g. '#WV-8831'
  status: PaymentStatus;
  statusText: string; // e.g. 'Validé Wave Instantané • Reçu #WV-8831'
  subtotalFormatted: string;
  deliveryFeeFormatted: string;
  totalPaidFormatted: string;
  driverPayoutFormatted: string;
  merchantPayoutFormatted: string;
  commissionNote: string;
}

export interface OrderDelivery {
  id: string;
  driverName?: string;
  driverPhone?: string;
  driverVehicle?: string;
  distanceFromClientText?: string;
  statusText: string; // e.g. 'En cours de route'
}

export interface OrderClient {
  id: string;
  name: string;
  phone: string;
  deliveryAddress: string;
}

export interface Order {
  id: string;
  reference: string; // e.g. '#AYY-1094'
  timeAgo: string; // e.g. 'il y a 6 min'
  createdTime: string; // e.g. '12:44'
  estimatedTime: string; // e.g. '13:12'
  client: OrderClient;
  establishmentName: string;
  establishmentDistrict: string;
  subOrders: SubOrder[];
  isMultiVendor: boolean;
  amountFormatted: string; // e.g. '9 500 FCFA'
  payment: OrderPayment;
  delivery: OrderDelivery;
  articlesCount: number;
  status: OrderStatus;
  statusText: string;
  statusDotColor: 'orange' | 'blue' | 'green' | 'red' | 'gray';
}

export interface OrderStatsSummary {
  todayCount: number;
  todayVolumeFormatted: string;
  preparingCount: number;
  deliveringCount: number;
  deliveredCount: number;
  deliveredSuccessRate: string;
  canceledCount: number;
  canceledAuditRate: string;
}

export interface LogisticsCorridor {
  id: string;
  name: string; // e.g. 'Axe Plateau • Corniche Ouest'
  deliveriesCount: number;
  averageTimeMinutes: number;
  barColor: 'green' | 'blue' | 'orange';
}

export type OrderFilterTab =
  | 'ALL'
  | 'EN_COURS'
  | 'A_PREPARER'
  | 'PRETES'
  | 'EN_LIVRAISON'
  | 'LIVREES'
  | 'ANNULEES';
