import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  DeliveryCorridor,
  DeliveryFilterTab,
  DeliveryItem,
  DeliveryStatsSummary,
  DeliveryStatus,
  DeliveryTimelineEvent
} from '../models/admin-delivery.models';
import { environment } from '../../../../environments/environment';

function mapBackendDeliveryToDeliveryItem(d: any): DeliveryItem {
  const rawStatut = (d.statut || '').toUpperCase();

  let status: DeliveryStatus = 'EN_ACHEMINEMENT';
  let statusDotColor: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray' = 'blue';

  if (rawStatut === 'EN_ATTENTE_PRISE_EN_CHARGE') {
    status = 'EN_ATTENTE_PRISE_EN_CHARGE';
    statusDotColor = 'purple';
  } else if (rawStatut === 'LIVREUR_ASSIGNE') {
    status = 'LIVREUR_ASSIGNE';
    statusDotColor = 'purple';
  } else if (rawStatut === 'RECUPERATION_EN_COURS') {
    status = 'RECUPERATION_EN_COURS';
    statusDotColor = 'purple';
  } else if (rawStatut === 'EN_ACHEMINEMENT') {
    status = 'EN_ACHEMINEMENT';
    statusDotColor = 'blue';
  } else if (rawStatut === 'EN_APPROCHE_CLIENT') {
    status = 'EN_APPROCHE_CLIENT';
    statusDotColor = 'green';
  } else if (rawStatut === 'LIVREE') {
    status = 'LIVREE';
    statusDotColor = 'green';
  } else if (rawStatut === 'SIGNALEMENT_RETARD') {
    status = 'SIGNALEMENT_RETARD';
    statusDotColor = 'orange';
  } else if (rawStatut === 'INCIDENT') {
    status = 'INCIDENT';
    statusDotColor = 'red';
  } else if (rawStatut === 'ANNULEE') {
    status = 'ANNULEE';
    statusDotColor = 'gray';
  }

  const isIncident = rawStatut === 'INCIDENT' || rawStatut === 'SIGNALEMENT_RETARD';
  const incidentReason = rawStatut === 'INCIDENT'
    ? 'Incident signalé sur la course'
    : rawStatut === 'SIGNALEMENT_RETARD'
    ? 'Signalement de retard'
    : undefined;

  const courierName = d.livreur_nom || 'Non assigné';
  const courierInitials = courierName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'L';

  const ref = d.commande_numero ? `#${d.commande_numero}` : `#AYY-${d.id}`;

  return {
    id: d.id ? d.id.toString() : '',
    reference: ref,
    courierName,
    courierPhone: d.livreur_telephone || d.telephone_destinataire || 'Non renseigné',
    courierVehicle: d.livreur_vehicule || 'Moto',
    courierPlate: d.livreur_immatriculation || 'Non immatriculé',
    courierBatteryPercent: 90,
    courierSpeedKmH: 25,
    courierSignalStatus: 'stable',
    courierInitials,
    originName: d.etablissement_nom || 'Établissement',
    originDistrict: d.etablissement_adresse ? d.etablissement_adresse.split(',')[0].trim() : 'Dakar',
    destinationName: d.nom_destinataire || d.client_nom || 'Client',
    destinationDistrict: d.adresse_livraison ? d.adresse_livraison.split(',')[0].trim() : 'Dakar',
    estimatedTimeText: '15 min',
    isIncident,
    incidentReason,
    status,
    statusText: d.statut_display || d.statut || 'En cours',
    statusDotColor
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminDeliveryService {
  private http = inject(HttpClient);

  private deliveriesSubject = new BehaviorSubject<DeliveryItem[]>([]);
  private selectedSubject = new BehaviorSubject<DeliveryItem | null>(null);

  deliveries$ = this.deliveriesSubject.asObservable();
  selectedDelivery$ = this.selectedSubject.asObservable();

  getStatsSummary(): Observable<DeliveryStatsSummary> {
    const url = `${environment.apiUrl}/api/admin/deliveries/`;
    return this.http.get<any>(url).pipe(
      map(res => {
        const rawItems: any[] = Array.isArray(res) ? res : (res.results || []);
        const items = rawItems.map(mapBackendDeliveryToDeliveryItem);

        const activeCoursesCount = items.filter(d =>
          d.status === 'EN_ACHEMINEMENT' ||
          d.status === 'EN_APPROCHE_CLIENT' ||
          d.status === 'RECUPERATION_EN_COURS' ||
          d.status === 'LIVREUR_ASSIGNE'
        ).length;

        const incidentsCount = items.filter(d => d.isIncident).length;

        return {
          activeCoursesCount: activeCoursesCount || items.length,
          avgDeliveryTimeMinutes: 23,
          punctualityRate: '96.8 %',
          incidentsCount,
          avgSpeedKmH: 28
        };
      }),
      catchError(() => of({
        activeCoursesCount: 0,
        avgDeliveryTimeMinutes: 0,
        punctualityRate: '100%',
        incidentsCount: 0,
        avgSpeedKmH: 0
      }))
    );
  }

  getCorridors(): Observable<DeliveryCorridor[]> {
    const items = this.deliveriesSubject.getValue();
    if (items.length === 0) {
      return of([
        {
          id: 'c-1',
          name: 'Plateau / Centre-Ville',
          trafficLevel: 'fluide',
          trafficLabel: 'Trafic fluide',
          volumeCount: 0,
          avgTimeMinutes: 15,
          color: 'green'
        },
        {
          id: 'c-2',
          name: 'Almadies / Ngor',
          trafficLevel: 'fluide',
          trafficLabel: 'Trafic fluide',
          volumeCount: 0,
          avgTimeMinutes: 20,
          color: 'green'
        }
      ]);
    }

    const corridorMap = new Map<string, number>();
    items.forEach(item => {
      const name = `${item.originDistrict} / ${item.destinationDistrict}`;
      corridorMap.set(name, (corridorMap.get(name) || 0) + 1);
    });

    const corridors: DeliveryCorridor[] = [];
    let idx = 1;
    corridorMap.forEach((count, name) => {
      corridors.push({
        id: `cor-${idx++}`,
        name,
        trafficLevel: count > 5 ? 'ralentissements' : (count > 2 ? 'modere' : 'fluide'),
        trafficLabel: count > 5 ? 'Ralentissements' : (count > 2 ? 'Trafic modéré' : 'Trafic fluide'),
        volumeCount: count,
        avgTimeMinutes: 15 + count * 2,
        color: count > 5 ? 'red' : (count > 2 ? 'orange' : 'green')
      });
    });

    return of(corridors);
  }

  getTimelineForDelivery(reference: string): Observable<DeliveryTimelineEvent[]> {
    return of([
      {
        time: 'Prise en charge',
        title: 'Prise en charge validée',
        subtitle: `Livraison ${reference}`,
        dotColor: 'gray'
      },
      {
        time: 'En cours',
        title: 'Acheminement en cours',
        subtitle: 'Suivi GPS actif',
        isHighlight: true,
        dotColor: 'orange'
      }
    ]);
  }

  selectDelivery(delivery: DeliveryItem | null): void {
    this.selectedSubject.next(delivery);
  }

  filterDeliveries(
    tab: DeliveryFilterTab,
    searchQuery: string,
    corridor: string,
    vehicle: string
  ): Observable<DeliveryItem[]> {
    let params = new HttpParams();

    if (tab === 'EN_ACHEMINEMENT') {
      params = params.set('statut', 'EN_ACHEMINEMENT');
    } else if (tab === 'INCIDENTS') {
      params = params.set('statut', 'INCIDENT');
    }

    const url = `${environment.apiUrl}/api/admin/deliveries/`;

    return this.http.get<any>(url, { params }).pipe(
      map(res => {
        const rawItems: any[] = Array.isArray(res) ? res : (res.results || []);
        let items = rawItems.map(mapBackendDeliveryToDeliveryItem);

        items = items.filter(item => {
          let matchTab = true;
          if (tab === 'EN_ACHEMINEMENT') {
            matchTab = item.status === 'EN_ACHEMINEMENT' || item.status === 'EN_APPROCHE_CLIENT';
          } else if (tab === 'EN_ATTENTE') {
            matchTab = item.status === 'EN_ATTENTE_PRISE_EN_CHARGE' || item.status === 'RECUPERATION_EN_COURS' || item.status === 'LIVREUR_ASSIGNE';
          } else if (tab === 'RETARD_POTENTIEL') {
            matchTab = item.status === 'SIGNALEMENT_RETARD' || item.isIncident;
          } else if (tab === 'INCIDENTS') {
            matchTab = item.isIncident || item.status === 'INCIDENT';
          }

          let matchSearch = true;
          if (searchQuery && searchQuery.trim().length > 0) {
            const q = searchQuery.toLowerCase().trim();
            const ref = item.reference.toLowerCase();
            const courier = item.courierName.toLowerCase();
            const dest = item.destinationName.toLowerCase();
            matchSearch = ref.includes(q) || courier.includes(q) || dest.includes(q);
          }

          let matchCorridor = true;
          if (corridor && corridor !== '' && corridor !== 'Tous les corridors') {
            matchCorridor = item.originDistrict.toLowerCase().includes(corridor.toLowerCase()) ||
                            item.destinationDistrict.toLowerCase().includes(corridor.toLowerCase());
          }

          let matchVehicle = true;
          if (vehicle && vehicle !== '' && vehicle !== 'Tous véhicules') {
            matchVehicle = item.courierVehicle.toLowerCase().includes(vehicle.toLowerCase());
          }

          return matchTab && matchSearch && matchCorridor && matchVehicle;
        });

        this.deliveriesSubject.next(items);

        const currentSelected = this.selectedSubject.getValue();
        if (items.length > 0) {
          if (!currentSelected || !items.some(d => d.id === currentSelected.id)) {
            this.selectedSubject.next(items[0]);
          }
        } else {
          this.selectedSubject.next(null);
        }

        return items;
      }),
      catchError(err => {
        console.error('Erreur chargement livraisons admin:', err);
        return of([]);
      })
    );
  }

  reassignCourier(deliveryId: string, newCourierName: string): void {
    const current = [...this.deliveriesSubject.value];
    const target = current.find(d => d.id === deliveryId);
    if (target) {
      target.courierName = newCourierName;
      target.status = 'EN_ACHEMINEMENT';
      target.statusText = 'En acheminement';
      target.statusDotColor = 'blue';
      target.isIncident = false;
      this.deliveriesSubject.next(current);
      if (this.selectedSubject.value?.id === deliveryId) {
        this.selectedSubject.next({ ...target });
      }
    }
  }

  closeIncident(deliveryId: string): Observable<DeliveryItem | null> {
    const url = `${environment.apiUrl}/api/admin/deliveries/${deliveryId}/close-incident/`;
    return this.http.post<any>(url, { resolution: 'Incident résolu par l\'administrateur' }).pipe(
      map(raw => {
        const updated = mapBackendDeliveryToDeliveryItem(raw);
        const currentDeliveries = this.deliveriesSubject.getValue().map(d => d.id === deliveryId ? updated : d);
        this.deliveriesSubject.next(currentDeliveries);

        if (this.selectedSubject.getValue()?.id === deliveryId) {
          this.selectedSubject.next(updated);
        }
        return updated;
      }),
      catchError(err => {
        console.error('Erreur clôture incident livraison:', err);
        return of(null);
      })
    );
  }
}

