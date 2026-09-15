import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { StatCard, AdminOrder, AdminDelivery, PendingAction } from '../models/admin.models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  getStatCards(): Observable<StatCard[]> {
    return of([
      { id: '1', title: 'UTILISATEURS', value: '24 580', subtext: '+142 aujourd\'hui', statusColor: 'positive', dotColor: '#10B981' },
      { id: '2', title: 'RESTAURANTS', value: '185', subtext: '162 actifs ce midi', statusColor: 'positive', dotColor: '#10B981' },
      { id: '3', title: 'VENDEURS', value: '74', subtext: '68 ouverts', statusColor: 'positive', dotColor: '#10B981' },
      { id: '4', title: 'LIVREURS', value: '148', subtext: '96 connectés en temps réel', statusColor: 'positive', dotColor: '#10B981' },
      { id: '5', title: 'COMMANDES DU JOUR', value: '1240', subtext: 'Pic de midi en cours', statusColor: 'negative', dotColor: '#E51B2A' },
      { id: '6', title: 'LIVRAISONS EN COURS', value: '58', subtext: 'Temps moyen : 23 min', statusColor: 'neutral' },
      { id: '7', title: 'REVENUS DU JOUR', value: '6 845 000 FCFA', subtext: 'Wave   OM   En direct', statusColor: 'neutral' },
      { id: '8', title: 'ABONNEMENTS', value: '238 actifs', subtext: '92% taux de renouvellement', statusColor: 'neutral' }
    ]);
  }

  getActiveOrders(): Observable<AdminOrder[]> {
    return of([
      {
        id: '1',
        reference: '#AYY-1084',
        customerName: 'Awa Ndiaye',
        merchantName: 'Chez Tantie Marie',
        amount: 9500,
        amountFormatted: '9 500 FCFA',
        status: 'Prête (Prise en charge livreur)',
        statusColor: 'green'
      },
      {
        id: '2',
        reference: '#AYY-1083',
        customerName: 'Moussa Sow',
        merchantName: 'Chez Loutcha',
        amount: 4500,
        amountFormatted: '4 500 FCFA',
        status: 'En préparation',
        statusColor: 'orange'
      },
      {
        id: '3',
        reference: '#AYY-1082',
        customerName: 'Fatou Binetou',
        merchantName: 'L\'Atelier du Choukouya',
        amount: 12000,
        amountFormatted: '12 000 FCFA',
        status: 'En livraison',
        statusColor: 'blue'
      },
      {
        id: '4',
        reference: '#AYY-1081',
        customerName: 'Oumar Diallo',
        merchantName: 'Burger Black Bun',
        amount: 6500,
        amountFormatted: '6 500 FCFA',
        status: 'En préparation',
        statusColor: 'orange'
      }
    ]);
  }

  getActiveDeliveries(): Observable<AdminDelivery[]> {
    return of([
      {
        id: '1',
        driverName: 'Ibrahima Faye',
        vehiclePlate: 'Moto #DK-8210',
        origin: 'Chez Loutcha',
        destination: 'Almadies',
        statusText: 'En route (8 min)',
        statusColor: 'red'
      },
      {
        id: '2',
        driverName: 'Cheikh Tidiane',
        vehiclePlate: 'Moto #DK-4412',
        origin: 'Chez Tantie Marie',
        destination: 'Plateau',
        statusText: 'Arrivé chez le client',
        statusColor: 'green'
      },
      {
        id: '3',
        driverName: 'Modou Fall',
        vehiclePlate: 'Moto #DK-9031',
        origin: 'Teranga Palace',
        destination: 'Mermoz',
        statusText: 'En route (14 min)',
        statusColor: 'red'
      }
    ]);
  }

  getPendingActions(): Observable<PendingAction[]> {
    return of([
      {
        id: '1',
        type: 'VALIDATION_RESTAURANT',
        title: 'Le Relais de la Corniche',
        description: 'Dossier en attente : NINEA & photos déposés pour approbation.',
        badgeText: 'Attente',
        actionButtonText: 'Examiner',
        targetId: 'app-resto-101'
      },
      {
        id: '2',
        type: 'VALIDATION_COURSIER',
        title: '2 candidatures livreurs',
        description: 'Permis et pièces d\'identité à contrôler (Secteur Dakar Sud).',
        badgeText: '2 nouveaux',
        actionButtonText: 'Vérifier',
        targetId: 'app-driver-202'
      },
      {
        id: '3',
        type: 'ABONNEMENT_ECHEANCE',
        title: '3 abonnements à échéance',
        description: 'Chez Fatou Traiteur, Touba Snack, Saveurs d\'Afrik arrivent à terme.',
        badgeText: 'Sous 48h',
        actionButtonText: 'Relancer',
        targetId: 'sub-303'
      }
    ]);
  }
}
