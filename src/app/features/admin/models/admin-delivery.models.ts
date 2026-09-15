export type DeliveryStatus =
  | 'EN_ATTENTE_PRISE_EN_CHARGE'
  | 'LIVREUR_ASSIGNE'
  | 'EN_ROUTE_RETRAIT'
  | 'RECUPERATION_EN_COURS'
  | 'COMMANDE_RECUPEREE'
  | 'EN_ACHEMINEMENT'
  | 'EN_APPROCHE_CLIENT'
  | 'LIVREE'
  | 'SIGNALEMENT_RETARD'
  | 'INCIDENT'
  | 'ANNULEE';

export interface DeliveryItem {
  id: string;
  reference: string; // e.g. '#AYY-1094'
  courierName: string; // e.g. 'Ibrahima Sow'
  courierPhone: string; // e.g. '+221 77 541 20 90'
  courierVehicle: string; // e.g. 'Yamaha Crypton'
  courierPlate: string; // e.g. 'DK-8492-AB'
  courierBatteryPercent: number; // e.g. 88
  courierSpeedKmH: number; // e.g. 14
  courierSignalStatus: string; // e.g. 'stable'
  courierInitials: string; // e.g. 'CN'
  originName: string; // e.g. 'Chez Loutcha'
  originDistrict: string; // e.g. 'Plateau'
  destinationName: string; // e.g. 'Fatou B. Sall'
  destinationDistrict: string; // e.g. 'Almadies'
  estimatedTimeText: string; // e.g. '14 min' or '+8 min'
  isIncident: boolean;
  incidentReason?: string;
  status: DeliveryStatus;
  statusText: string; // e.g. 'En acheminement', 'Signalement retard'
  statusDotColor: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray';
}

export interface DeliveryStatsSummary {
  activeCoursesCount: number; // e.g. 74
  avgDeliveryTimeMinutes: number; // e.g. 23
  punctualityRate: string; // e.g. '96.8 %'
  incidentsCount: number; // e.g. 3
  avgSpeedKmH: number; // e.g. 28
}

export interface DeliveryCorridor {
  id: string;
  name: string; // e.g. 'Corniche Ouest / Plateau'
  trafficLevel: 'fluide' | 'modere' | 'ralentissements';
  trafficLabel: string; // e.g. 'Trafic fluide'
  volumeCount: number; // e.g. 32
  avgTimeMinutes: number; // e.g. 18
  color: 'green' | 'orange' | 'red';
}

export interface DeliveryTimelineEvent {
  time: string; // e.g. '12:50'
  title: string; // e.g. 'Prise en charge validée'
  subtitle: string; // e.g. 'Burger Black Bun (Almadies)'
  isHighlight?: boolean;
  dotColor: 'gray' | 'orange' | 'green' | 'red';
}

export type DeliveryFilterTab =
  | 'ALL'
  | 'EN_ACHEMINEMENT'
  | 'EN_ATTENTE'
  | 'RETARD_POTENTIEL'
  | 'INCIDENTS';
