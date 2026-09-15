export type UserAccountCategory = 'CLIENT' | 'PROFESSIONNEL';
export type UserStatus = 'ACTIF' | 'DESACTIVE';

export interface UserRecentOrder {
  id: string;
  merchantName: string;
  orderRef: string;
  amount: number;
  amountFormatted: string;
  statusText: string;
  statusColor: 'orange' | 'green' | 'red';
}

export interface AdminUserDetail {
  id: string;
  accountNumber: string; // e.g. '#USR-84920'
  firstName: string;
  lastName: string;
  merchantName?: string;
  email: string;
  phone: string;
  accountTypeLabel: string; // e.g. 'Client Gourmand' or 'Professionnel (Restaurant)'
  accountTypeSublabel?: string; // e.g. '(Particulier Dakar)'
  categoryGroup: UserAccountCategory;
  status: UserStatus;
  address: string;
  registrationDate: string;
  lastActivity: string;
  ordersCount: number;
  completedPercent: string;
  totalSpent: number;
  totalSpentFormatted: string;
  averageBasket: number;
  averageBasketFormatted: string;
  preferredPaymentMethod: string;
  preferredPaymentPhone: string;
  recentOrders: UserRecentOrder[];
}

export interface UserStatsSummary {
  total: number;
  clients: number;
  professionals: number;
  active: number;
  disabled: number;
}

export type UserFilterTab = 'ALL' | 'CLIENTS' | 'PROFESSIONALS' | 'ACTIVE' | 'DISABLED';
