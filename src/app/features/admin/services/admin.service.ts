import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { StatCard, AdminOrder, AdminDelivery, PendingAction } from '../models/admin.models';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);

  getStatCards(): Observable<StatCard[]> {
    const url = `${environment.apiUrl}/api/admin/dashboard/`;
    return this.http.get<any>(url).pipe(
      map(data => {
        const totalUsers = data.total_utilisateurs ?? 0;
        const restaurants = data.restaurants ?? 0;
        const vendeurs = data.vendeurs ?? 0;
        const livreurs = data.livreurs ?? 0;
        const livreursDispo = data.livreurs_disponibles ?? 0;
        const commandesJour = data.commandes_jour ?? 0;
        const livraisonsActives = data.livraisons_actives ?? 0;
        const gmvJour = data.gmv_jour ?? 0;
        const dossiersAttente = data.dossiers_en_attente ?? 0;
        const details = data.details_dossiers || {};
        const etabsNonVerifies = details.etablissements_non_verifies ?? 0;
        const livreursAttente = details.livreurs_en_attente ?? 0;

        const gmvFormatted = new Intl.NumberFormat('fr-FR').format(gmvJour) + ' FCFA';

        return [
          {
            id: '1',
            title: 'UTILISATEURS',
            value: new Intl.NumberFormat('fr-FR').format(totalUsers),
            subtext: 'Inscrits sur la plateforme',
            statusColor: 'positive',
            dotColor: '#10B981'
          },
          {
            id: '2',
            title: 'RESTAURANTS',
            value: new Intl.NumberFormat('fr-FR').format(restaurants),
            subtext: 'Partenaires enregistrés',
            statusColor: 'positive',
            dotColor: '#10B981'
          },
          {
            id: '3',
            title: 'VENDEURS',
            value: new Intl.NumberFormat('fr-FR').format(vendeurs),
            subtext: 'Commerces partenaires',
            statusColor: 'positive',
            dotColor: '#10B981'
          },
          {
            id: '4',
            title: 'LIVREURS',
            value: new Intl.NumberFormat('fr-FR').format(livreurs),
            subtext: `${livreursDispo} connectés en temps réel`,
            statusColor: 'positive',
            dotColor: '#10B981'
          },
          {
            id: '5',
            title: 'COMMANDES DU JOUR',
            value: new Intl.NumberFormat('fr-FR').format(commandesJour),
            subtext: 'Commandes enregistrées',
            statusColor: 'neutral'
          },
          {
            id: '6',
            title: 'LIVRAISONS EN COURS',
            value: new Intl.NumberFormat('fr-FR').format(livraisonsActives),
            subtext: 'Livraisons actives en route',
            statusColor: 'neutral'
          },
          {
            id: '7',
            title: 'REVENUS DU JOUR',
            value: gmvFormatted,
            subtext: 'Volume d\'affaires (GMV)',
            statusColor: 'neutral'
          },
          {
            id: '8',
            title: 'DOSSIERS EN ATTENTE',
            value: new Intl.NumberFormat('fr-FR').format(dossiersAttente),
            subtext: `${etabsNonVerifies} étabs, ${livreursAttente} livreurs`,
            statusColor: dossiersAttente > 0 ? 'warning' : 'positive',
            dotColor: dossiersAttente > 0 ? '#F59E0B' : '#10B981'
          }
        ] as StatCard[];
      }),
      catchError(() => of([]))
    );
  }

  getActiveOrders(): Observable<AdminOrder[]> {
    const url = `${environment.apiUrl}/api/admin/orders/`;
    return this.http.get<any>(url).pipe(
      map(res => {
        const rawItems: any[] = Array.isArray(res) ? res : (res.results || []);
        return rawItems.slice(0, 5).map(o => {
          const rawStatut = (o.statut || '').toUpperCase();
          let statusColor: 'orange' | 'green' | 'blue' | 'red' = 'orange';
          if (rawStatut === 'LIVREE' || rawStatut === 'PRETE') statusColor = 'green';
          else if (rawStatut === 'EN_LIVRAISON') statusColor = 'blue';
          else if (rawStatut === 'ANNULEE') statusColor = 'red';

          const totalNum = Number(o.total || 0);
          return {
            id: o.id.toString(),
            reference: o.numero_commande ? `#${o.numero_commande}` : `#AYY-${o.id}`,
            customerName: o.nom_destinataire || o.client_nom || 'Client AYYOU',
            merchantName: o.etablissement_nom || 'Établissement AYYOU',
            amount: totalNum,
            amountFormatted: `${new Intl.NumberFormat('fr-FR').format(totalNum)} FCFA`,
            status: o.statut_display || o.statut || 'En cours',
            statusColor
          };
        });
      }),
      catchError(() => of([]))
    );
  }

  getActiveDeliveries(): Observable<AdminDelivery[]> {
    const url = `${environment.apiUrl}/api/admin/deliveries/`;
    return this.http.get<any>(url).pipe(
      map(res => {
        const rawItems: any[] = Array.isArray(res) ? res : (res.results || []);
        return rawItems.slice(0, 5).map(d => {
          const rawStatut = (d.statut || '').toUpperCase();
          let statusColor: 'red' | 'green' | 'blue' = 'red';
          if (rawStatut === 'LIVREE') statusColor = 'green';
          else if (rawStatut === 'EN_LIVRAISON' || rawStatut === 'ACCEPTEE') statusColor = 'blue';

          return {
            id: d.id.toString(),
            driverName: d.livreur_nom_complet || 'Livreur non attribué',
            vehiclePlate: d.livreur_vehicule || 'Moto',
            origin: d.etablissement_nom || 'Établissement AYYOU',
            destination: d.adresse_livraison ? d.adresse_livraison.split(',')[0].trim() : 'Dakar',
            statusText: d.statut_display || d.statut || 'En route',
            statusColor
          };
        });
      }),
      catchError(() => of([]))
    );
  }

  getPendingActions(): Observable<PendingAction[]> {
    const url = `${environment.apiUrl}/api/admin/dashboard/pending-actions/`;
    return this.http.get<any>(url).pipe(
      map(data => {
        const etabs = data.etablissements_en_attente || [];
        const livreurs = data.livreurs_en_attente || [];
        const actions: PendingAction[] = [];

        etabs.forEach((e: any) => {
          actions.push({
            id: `etab-${e.id}`,
            type: 'VALIDATION_RESTAURANT',
            title: e.nom || 'Établissement sans nom',
            description: `Dossier ${(e.type_etablissement || 'Établissement').toLowerCase()} en attente de vérification (${e.proprietaire || e.email || 'Nouveau'})`,
            badgeText: 'Attente',
            actionButtonText: 'Examiner',
            targetId: e.id ? e.id.toString() : ''
          });
        });

        livreurs.forEach((l: any) => {
          actions.push({
            id: `livr-${l.id}`,
            type: 'VALIDATION_COURSIER',
            title: l.nom || 'Livreur sans nom',
            description: `Candidature livreur ${l.type_vehicule || 'Moto'} à contrôler (${l.telephone || l.email || 'Nouveau'})`,
            badgeText: 'Nouveau',
            actionButtonText: 'Vérifier',
            targetId: l.id ? l.id.toString() : ''
          });
        });

        return actions;
      }),
      catchError(() => of([]))
    );
  }
}
