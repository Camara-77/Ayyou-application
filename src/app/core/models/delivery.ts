export interface DeliveryDriver {
  id: string;
  name: string;
  rating: number;
  status: string;
  zone: string;
  avatarUrl: string;
}

export interface DeliveryAssignedCourse {
  id: string;
  orderRef: string;
  remunerationFcfa: number;
  kitchenTimeText: string;
  restaurantName: string;
  restaurantAddress: string;
  dishesCountText: string;
  clientAddress: string;
  distanceTimeText: string;
  itemsSummary: string;
  timerSeconds: number;
  initialTimerSeconds: number;
  status: 'ASSIGNED' | 'ACCEPTED' | 'EXPIRED' | 'DECLINED';
}

export interface DeliveryAvailableCourse {
  id: string;
  orderRef: string;
  remunerationFcfa: number;
  restaurantName: string;
  restaurantAddressNote: string;
  clientAddress: string;
  distanceTimeText: string;
  requiresInsulatedBag?: boolean;
}
