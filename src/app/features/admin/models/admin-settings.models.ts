export type SystemRoleType =
  | 'Super Administrateur'
  | 'Responsable Logistique Dakar'
  | 'Modérateur Catalogue & Contenu'
  | 'Gestionnaire Facturation & Payouts'
  | 'Support Opérationnel Niveau 1';

export interface AdminCollaborator {
  id: string;
  initials: string;
  name: string;
  subtitle?: string;
  email: string;
  role: SystemRoleType;
  scope: string;
  lastConnection: string;
  isOnline: boolean;
  avatarColor?: string;
}

export interface RolePermissionItem {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface SecurityRequirements {
  twoFactorAuth: string;
  sessionTimeoutMinutes: number;
  ipRestriction: string;
}

export interface RolePermissionsConfig {
  roleName: SystemRoleType;
  tagline: string;
  description: string;
  permissions: RolePermissionItem[];
  securityRequirements: SecurityRequirements;
}

export interface SettingsSummaryCardData {
  id: string;
  title: string;
  mainValue: string;
  subtext: string;
  dotColor: 'red' | 'green' | 'orange' | 'blue';
}

export interface GeographicZone {
  id: string;
  name: string;
  districtsCount: number;
  corridorsCount: number;
  isActive: boolean;
  baseDeliveryFee: number;
  districtsList: string[];
}

export interface DeliveryCorridor {
  id: string;
  name: string;
  originZone: string;
  destinationZone: string;
  distanceKm: number;
  priceFcfa: number;
  isActive: boolean;
}

export interface PricingTier {
  id: string;
  distanceLabel: string;
  minDistanceKm: number;
  maxDistanceKm: number;
  priceFcfa: number;
  nightSurchargeFcfa: number;
  weatherSurchargeFcfa: number;
  isActive: boolean;
}

export interface PaymentGatewayConfig {
  id: string;
  provider: 'WAVE' | 'ORANGE_MONEY' | 'SEPA' | 'CASH';
  name: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'OFFLINE';
  statusLabel: string;
  uptimePercentage: string;
  merchantFeePercentage: number;
  isSandbox: boolean;
  lastPingText: string;
}

export interface AuditLogEntry {
  id: string;
  administratorName: string;
  adminEmail: string;
  action: string;
  targetResource: string;
  timestampText: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  statusLabel: string;
}
