import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import {
  AdminCollaborator,
  AuditLogEntry,
  DeliveryCorridor,
  GeographicZone,
  PaymentGatewayConfig,
  PricingTier,
  RolePermissionsConfig,
  SettingsSummaryCardData,
  SystemRoleType
} from '../models/admin-settings.models';

@Injectable({
  providedIn: 'root'
})
export class AdminSettingsService {
  private mockSummaryCards: SettingsSummaryCardData[] = [
    {
      id: 'sum-1',
      title: 'ÉQUIPE ACCÈS CONSOLE',
      mainValue: '8 comptes',
      subtext: '• Super Admins, Logistique, Mo',
      dotColor: 'red'
    },
    {
      id: 'sum-2',
      title: 'STATUT API PLATEFORME',
      mainValue: 'Opérationnel (99.98%)',
      subtext: '• Passerelles Wave, OM, Téléme',
      dotColor: 'green'
    },
    {
      id: 'sum-3',
      title: 'DÉCOUPAGE TERRITORIAL',
      mainValue: '12 zones',
      subtext: '• Grand Dakar, Rufisque, Diamni',
      dotColor: 'orange'
    },
    {
      id: 'sum-4',
      title: 'FRAIS DE BASE LIVRAISON',
      mainValue: '1 000 FCFA',
      subtext: '• Tarif socle < 3 km • Révisé le 0...',
      dotColor: 'red'
    }
  ];

  private mockCollaborators: AdminCollaborator[] = [
    {
      id: 'col-1',
      initials: 'MD',
      name: 'Mamadou Diallo',
      subtitle: '(Admin Principal)',
      email: 'mamadou.d@ayyou.sn',
      role: 'Super Administrateur',
      scope: 'Accès Total (Tous modules & finances)',
      lastConnection: 'En ligne actuellement',
      isOnline: true,
      avatarColor: '#E51B2A'
    },
    {
      id: 'col-2',
      initials: 'AB',
      name: 'Aïssatou Ba',
      email: 'aissatou.ba@ayyou.sn',
      role: 'Responsable Logistique Dakar',
      scope: 'Livreurs, Livraisons & Corridors',
      lastConnection: 'Il y a 18 min',
      isOnline: false,
      avatarColor: '#4F46E5'
    },
    {
      id: 'col-3',
      initials: 'CN',
      name: 'Cheikh Tidiane Ndiaye',
      email: 'cheikh.n@ayyou.sn',
      role: 'Modérateur Catalogue & Contenu',
      scope: 'Catalogue, Fiches Plats & Vidéos Reels',
      lastConnection: 'Il y a 1 h',
      isOnline: false,
      avatarColor: '#059669'
    },
    {
      id: 'col-4',
      initials: 'FS',
      name: 'Fatou Kiné Sow',
      email: 'fatou.k@ayyou.sn',
      role: 'Gestionnaire Facturation & Payouts',
      scope: 'Paiements, Abonnements & Litiges',
      lastConnection: 'Hier à 17h',
      isOnline: false,
      avatarColor: '#D97706'
    },
    {
      id: 'col-5',
      initials: 'OK',
      name: 'Oumar Kane',
      email: 'oumar.k@ayyou.sn',
      role: 'Support Opérationnel Niveau 1',
      scope: 'Commandes, Utilisateurs (Lecture/Support)',
      lastConnection: 'Il y a 3 jours',
      isOnline: false,
      avatarColor: '#6B7280'
    }
  ];

  private mockSuperAdminPermissions: RolePermissionsConfig = {
    roleName: 'Super Administrateur',
    tagline: 'PANNEAU DE GESTION FINE',
    description: "Droits d'élévation maximale pour la gouvernance de la plateforme AYYOU Sénégal.",
    permissions: [
      {
        id: 'perm-1',
        label: 'Gestion des comptes utilisateurs',
        description: 'Suspension, blocage et radiation immédiate',
        enabled: true
      },
      {
        id: 'perm-2',
        label: 'Approbation des pièces légales marchands',
        description: 'Validation définitive NINEA, RCCM et agrément sanitaire',
        enabled: true
      },
      {
        id: 'perm-3',
        label: 'Déclenchement des virements bancaires',
        description: 'Exécution manuelle des payouts Wave, OM & virement SEPA',
        enabled: true
      },
      {
        id: 'perm-4',
        label: 'Modification de la grille tarifaire',
        description: 'Barème kilométrique et majorations météo / nuit',
        enabled: true
      },
      {
        id: 'perm-5',
        label: "Accès complet aux journaux d'audit",
        description: "Télémétrie brute GPS des livreurs et traces d'accès",
        enabled: true
      },
      {
        id: 'perm-6',
        label: 'Exportation des bases de données',
        description: 'Téléchargement sécurisé format CSV / écritures comptables',
        enabled: true
      }
    ],
    securityRequirements: {
      twoFactorAuth: 'STRICTEMENT OBLIGATOIRE',
      sessionTimeoutMinutes: 30,
      ipRestriction: 'Siège Almadies & VPN'
    }
  };

  private mockGeographicZones: GeographicZone[] = [
    { id: 'z-1', name: 'Plateau & Centre-Ville', districtsCount: 6, corridorsCount: 14, isActive: true, baseDeliveryFee: 1000, districtsList: ['Plateau', 'Medina', 'Fann', 'Point E', 'Rebeuss', 'Gueule Tapée'] },
    { id: 'z-2', name: 'Almadies & Les Mamelles', districtsCount: 4, corridorsCount: 12, isActive: true, baseDeliveryFee: 1200, districtsList: ['Almadies', 'Les Mamelles', 'Ngor', 'Ouakam'] },
    { id: 'z-3', name: 'Mermoz & Sacré-Cœur', districtsCount: 5, corridorsCount: 10, isActive: true, baseDeliveryFee: 1000, districtsList: ['Mermoz', 'Sacré-Cœur 1', 'Sacré-Cœur 2', 'Sacré-Cœur 3', 'Kermel'] },
    { id: 'z-4', name: 'Grand Dakar & HLMs', districtsCount: 8, corridorsCount: 18, isActive: true, baseDeliveryFee: 1000, districtsList: ['HLM', 'Grand Dakar', 'Dieuppeul', 'Derklé', 'Liberté 1-6'] },
    { id: 'z-5', name: 'Banlieue & Pikine', districtsCount: 7, corridorsCount: 15, isActive: true, baseDeliveryFee: 1500, districtsList: ['Pikine', 'Guédiawaye', 'Thiaroye', 'Parcelles Assainies'] }
  ];

  private mockDeliveryCorridors: DeliveryCorridor[] = [
    { id: 'cor-1', name: 'Corridor Express Plateau -> Almadies', originZone: 'Plateau & Centre-Ville', destinationZone: 'Almadies & Les Mamelles', distanceKm: 14.5, priceFcfa: 2500, isActive: true },
    { id: 'cor-2', name: 'Corridor Urbain Mermoz -> Point E', originZone: 'Mermoz & Sacré-Cœur', destinationZone: 'Plateau & Centre-Ville', distanceKm: 5.2, priceFcfa: 1200, isActive: true },
    { id: 'cor-3', name: 'Corridor Est Dakar -> Pikine', originZone: 'Grand Dakar & HLMs', destinationZone: 'Banlieue & Pikine', distanceKm: 11.0, priceFcfa: 1800, isActive: true }
  ];

  private mockPricingTiers: PricingTier[] = [
    { id: 'tier-1', distanceLabel: '0 km à 3 km (Zone Socle)', minDistanceKm: 0, maxDistanceKm: 3, priceFcfa: 1000, nightSurchargeFcfa: 300, weatherSurchargeFcfa: 500, isActive: true },
    { id: 'tier-2', distanceLabel: '3.1 km à 7 km (Zone Intermédiaire)', minDistanceKm: 3.1, maxDistanceKm: 7, priceFcfa: 1500, nightSurchargeFcfa: 500, weatherSurchargeFcfa: 500, isActive: true },
    { id: 'tier-3', distanceLabel: '7.1 km à 15 km (Zone Élargie)', minDistanceKm: 7.1, maxDistanceKm: 15, priceFcfa: 2500, nightSurchargeFcfa: 700, weatherSurchargeFcfa: 800, isActive: true },
    { id: 'tier-4', distanceLabel: '> 15 km (Grande Banlieue)', minDistanceKm: 15.1, maxDistanceKm: 35, priceFcfa: 3500, nightSurchargeFcfa: 1000, weatherSurchargeFcfa: 1000, isActive: true }
  ];

  private mockPaymentGateways: PaymentGatewayConfig[] = [
    { id: 'gw-1', provider: 'WAVE', name: 'Wave Mobile Money Sénégal', status: 'OPERATIONAL', statusLabel: 'Opérationnel API v2', uptimePercentage: '99.99%', merchantFeePercentage: 1.0, isSandbox: false, lastPingText: 'Il y a 2 sec' },
    { id: 'gw-2', provider: 'ORANGE_MONEY', name: 'Orange Money Web Payment API', status: 'OPERATIONAL', statusLabel: 'Opérationnel WebPay', uptimePercentage: '99.95%', merchantFeePercentage: 1.2, isSandbox: false, lastPingText: 'Il y a 14 sec' },
    { id: 'gw-3', provider: 'SEPA', name: 'Virements Bancaires Payouts', status: 'OPERATIONAL', statusLabel: 'Swift/IBAN Actif', uptimePercentage: '100%', merchantFeePercentage: 0.0, isSandbox: false, lastPingText: 'Synchronisé 08:00' }
  ];

  private mockAuditLogs: AuditLogEntry[] = [
    { id: 'log-1', administratorName: 'Mamadou Diallo', adminEmail: 'mamadou.d@ayyou.sn', action: 'Modification Grille Tarifaire', targetResource: 'Tarif Socle < 3km (1000 FCFA)', timestampText: 'Aujourd\'hui à 14:10', ipAddress: '197.220.180.45', status: 'SUCCESS', statusLabel: 'Succès' },
    { id: 'log-2', administratorName: 'Fatou Kiné Sow', adminEmail: 'fatou.k@ayyou.sn', action: 'Déclenchement Payout Virement', targetResource: 'Batch Marchands Plateau (4.2M FCFA)', timestampText: 'Aujourd\'hui à 11:30', ipAddress: '197.220.181.12', status: 'SUCCESS', statusLabel: 'Succès' },
    { id: 'log-3', administratorName: 'Cheikh Tidiane Ndiaye', adminEmail: 'cheikh.n@ayyou.sn', action: 'Modération Produit Refusé', targetResource: 'Fiche Article DKR-ALM-009', timestampText: 'Hier à 16:45', ipAddress: '197.220.180.99', status: 'WARNING', statusLabel: 'Avertissement' },
    { id: 'log-4', administratorName: 'Aïssatou Ba', adminEmail: 'aissatou.ba@ayyou.sn', action: 'Création Zone Géographique', targetResource: 'Zone Almadies & Les Mamelles', timestampText: '14/09/2026 à 09:15', ipAddress: '197.220.182.04', status: 'SUCCESS', statusLabel: 'Succès' }
  ];

  private summaryCardsSubject = new BehaviorSubject<SettingsSummaryCardData[]>(this.mockSummaryCards);
  private collaboratorsSubject = new BehaviorSubject<AdminCollaborator[]>(this.mockCollaborators);
  private rolePermissionsSubject = new BehaviorSubject<RolePermissionsConfig>(this.mockSuperAdminPermissions);
  private geographicZonesSubject = new BehaviorSubject<GeographicZone[]>(this.mockGeographicZones);
  private deliveryCorridorsSubject = new BehaviorSubject<DeliveryCorridor[]>(this.mockDeliveryCorridors);
  private pricingTiersSubject = new BehaviorSubject<PricingTier[]>(this.mockPricingTiers);
  private paymentGatewaysSubject = new BehaviorSubject<PaymentGatewayConfig[]>(this.mockPaymentGateways);
  private auditLogsSubject = new BehaviorSubject<AuditLogEntry[]>(this.mockAuditLogs);

  summaryCards$ = this.summaryCardsSubject.asObservable();
  collaborators$ = this.collaboratorsSubject.asObservable();
  rolePermissions$ = this.rolePermissionsSubject.asObservable();
  geographicZones$ = this.geographicZonesSubject.asObservable();
  deliveryCorridors$ = this.deliveryCorridorsSubject.asObservable();
  pricingTiers$ = this.pricingTiersSubject.asObservable();
  paymentGateways$ = this.paymentGatewaysSubject.asObservable();
  auditLogs$ = this.auditLogsSubject.asObservable();

  constructor() {}

  getCollaborators(searchQuery?: string): Observable<AdminCollaborator[]> {
    let list = [...this.collaboratorsSubject.value];
    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.scope.toLowerCase().includes(q)
      );
    }
    return of(list);
  }

  inviteCollaborator(newCollab: {
    name: string;
    email: string;
    role: SystemRoleType;
    scope: string;
  }): Observable<AdminCollaborator> {
    const nameParts = newCollab.name.trim().split(' ');
    const initials = nameParts.length >= 2
      ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
      : newCollab.name.slice(0, 2).toUpperCase();

    const created: AdminCollaborator = {
      id: 'col-' + (this.collaboratorsSubject.value.length + 1),
      initials,
      name: newCollab.name,
      email: newCollab.email,
      role: newCollab.role,
      scope: newCollab.scope,
      lastConnection: 'Invitation envoyée',
      isOnline: false,
      avatarColor: '#E51B2A'
    };

    const updatedList = [created, ...this.collaboratorsSubject.value];
    this.collaboratorsSubject.next(updatedList);

    // Update count in summary cards
    const cards = [...this.summaryCardsSubject.value];
    cards[0].mainValue = `${updatedList.length} comptes`;
    this.summaryCardsSubject.next(cards);

    return of(created);
  }

  togglePermission(permissionId: string): void {
    const config = { ...this.rolePermissionsSubject.value };
    const perm = config.permissions.find(p => p.id === permissionId);
    if (perm) {
      perm.enabled = !perm.enabled;
      this.rolePermissionsSubject.next(config);
    }
  }

  saveAllSettings(): Observable<boolean> {
    // Simulates API save to Django backend
    return of(true);
  }
}
