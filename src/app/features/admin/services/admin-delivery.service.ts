import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  DeliveryCorridor,
  DeliveryFilterTab,
  DeliveryItem,
  DeliveryStatsSummary,
  DeliveryStatus,
  DeliveryTimelineEvent
} from '../models/admin-delivery.models';

@Injectable({
  providedIn: 'root'
})
export class AdminDeliveryService {
  private mockDeliveries: DeliveryItem[] = [
    {
      id: 'd-1094',
      reference: '#AYY-1094',
      courierName: 'Ibrahima Sow',
      courierPhone: '+221 77 541 20 90',
      courierVehicle: 'Yamaha Crypton',
      courierPlate: 'DK-8492-AB',
      courierBatteryPercent: 92,
      courierSpeedKmH: 26,
      courierSignalStatus: 'stable',
      courierInitials: 'IS',
      originName: 'Chez Loutcha',
      originDistrict: 'Plateau',
      destinationName: 'Fatou B. Sall',
      destinationDistrict: 'Almadies',
      estimatedTimeText: '14 min',
      isIncident: false,
      status: 'EN_ACHEMINEMENT',
      statusText: 'En acheminement',
      statusDotColor: 'blue'
    },
    {
      id: 'd-1095',
      reference: '#AYY-1095',
      courierName: 'Modou Fall',
      courierPhone: '+221 78 632 11 00',
      courierVehicle: 'Boxer 150',
      courierPlate: 'DK-1029-BC',
      courierBatteryPercent: 95,
      courierSpeedKmH: 22,
      courierSignalStatus: 'stable',
      courierInitials: 'MF',
      originName: 'Touba Primeurs',
      originDistrict: 'Mermoz',
      destinationName: 'Aïmadou Kane',
      destinationDistrict: 'Fann',
      estimatedTimeText: '6 min',
      isIncident: false,
      status: 'EN_APPROCHE_CLIENT',
      statusText: 'En approche client',
      statusDotColor: 'green'
    },
    {
      id: 'd-1096',
      reference: '#AYY-1096',
      courierName: 'Cheikh Ndiaye',
      courierPhone: '+221 77 551 20 45',
      courierVehicle: 'Kymco Agility',
      courierPlate: 'DK-5512-AZ',
      courierBatteryPercent: 88,
      courierSpeedKmH: 14,
      courierSignalStatus: 'stable',
      courierInitials: 'CN',
      originName: 'Burger Black Bun',
      originDistrict: 'Almadies',
      destinationName: 'Ousmane Ba',
      destinationDistrict: 'Ngor',
      estimatedTimeText: '+8 min Rond-point Almadies',
      isIncident: true,
      incidentReason: 'Retard signalé (Trafic)',
      status: 'SIGNALEMENT_RETARD',
      statusText: 'Signalement retard',
      statusDotColor: 'orange'
    },
    {
      id: 'd-1097',
      reference: '#AYY-1097',
      courierName: 'Babacar Diop',
      courierPhone: '+221 77 889 00 11',
      courierVehicle: 'TVS HLX',
      courierPlate: 'DK-7788-DE',
      courierBatteryPercent: 78,
      courierSpeedKmH: 30,
      courierSignalStatus: 'stable',
      courierInitials: 'BD',
      originName: "L'Atelier du Choukouya",
      originDistrict: 'Ouakam',
      destinationName: 'Aïcha Seck',
      destinationDistrict: 'Point E',
      estimatedTimeText: '18 min',
      isIncident: false,
      status: 'EN_ACHEMINEMENT',
      statusText: 'En acheminement',
      statusDotColor: 'blue'
    },
    {
      id: 'd-1098',
      reference: '#AYY-1098',
      courierName: 'El Hadj Diallo',
      courierPhone: '+221 76 210 44 33',
      courierVehicle: 'Yamaha 125',
      courierPlate: 'DK-4455-CD',
      courierBatteryPercent: 84,
      courierSpeedKmH: 18,
      courierSignalStatus: 'stable',
      courierInitials: 'ED',
      originName: 'Dakar Sweets',
      originDistrict: 'Point E',
      destinationName: 'Malick Ndao',
      destinationDistrict: 'Plateau',
      estimatedTimeText: '2 min',
      isIncident: false,
      status: 'RECUPERATION_EN_COURS',
      statusText: 'Récupération en cours',
      statusDotColor: 'purple'
    }
  ];

  private mockCorridors: DeliveryCorridor[] = [
    {
      id: 'c-1',
      name: 'Corniche Ouest / Plateau',
      trafficLevel: 'fluide',
      trafficLabel: 'Trafic fluide',
      volumeCount: 32,
      avgTimeMinutes: 18,
      color: 'green'
    },
    {
      id: 'c-2',
      name: 'Almadies / Route Almadies',
      trafficLevel: 'modere',
      trafficLabel: 'Trafic modéré',
      volumeCount: 24,
      avgTimeMinutes: 22,
      color: 'orange'
    },
    {
      id: 'c-3',
      name: 'VDN / Patte d\'Oie',
      trafficLevel: 'ralentissements',
      trafficLabel: 'Ralentissements',
      volumeCount: 18,
      avgTimeMinutes: 31,
      color: 'red'
    }
  ];

  private deliveriesSubject = new BehaviorSubject<DeliveryItem[]>(this.mockDeliveries);
  private selectedSubject = new BehaviorSubject<DeliveryItem | null>(this.mockDeliveries[2]); // #AYY-1096 by default

  deliveries$ = this.deliveriesSubject.asObservable();
  selectedDelivery$ = this.selectedSubject.asObservable();

  getStatsSummary(): Observable<DeliveryStatsSummary> {
    return of({
      activeCoursesCount: 74,
      avgDeliveryTimeMinutes: 23,
      punctualityRate: '96,8 %',
      incidentsCount: 3,
      avgSpeedKmH: 28
    });
  }

  getCorridors(): Observable<DeliveryCorridor[]> {
    return of(this.mockCorridors);
  }

  getTimelineForDelivery(reference: string): Observable<DeliveryTimelineEvent[]> {
    return of([
      {
        time: '12:50',
        title: 'Prise en charge validée',
        subtitle: 'Burger Black Bun (Almadies)',
        dotColor: 'gray'
      },
      {
        time: '13:02',
        title: 'Ralentissement détecté',
        subtitle: 'Rond-Point Ngor / Route des Almadies (travaux)',
        isHighlight: true,
        dotColor: 'orange'
      },
      {
        time: '13:10 (Estimé)',
        title: 'Arrivée client',
        subtitle: 'Ousmane Ba (Villa 42, Ngor)',
        dotColor: 'gray'
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
    return this.deliveries$.pipe(
      map(items => {
        return items.filter(item => {
          // Tab Filter
          let matchTab = true;
          if (tab === 'EN_ACHEMINEMENT') {
            matchTab = item.status === 'EN_ACHEMINEMENT' || item.status === 'EN_APPROCHE_CLIENT';
          } else if (tab === 'EN_ATTENTE') {
            matchTab = item.status === 'EN_ATTENTE_PRISE_EN_CHARGE' || item.status === 'RECUPERATION_EN_COURS';
          } else if (tab === 'RETARD_POTENTIEL') {
            matchTab = item.status === 'SIGNALEMENT_RETARD' || item.isIncident;
          } else if (tab === 'INCIDENTS') {
            matchTab = item.isIncident || item.status === 'INCIDENT';
          }

          // Search Query Filter
          let matchSearch = true;
          if (searchQuery && searchQuery.trim().length > 0) {
            const q = searchQuery.toLowerCase().trim();
            const ref = item.reference.toLowerCase();
            const courier = item.courierName.toLowerCase();
            const dest = item.destinationName.toLowerCase();
            matchSearch = ref.includes(q) || courier.includes(q) || dest.includes(q);
          }

          // Corridor Filter
          let matchCorridor = true;
          if (corridor && corridor !== '' && corridor !== 'Tous les corridors') {
            matchCorridor = item.originDistrict.toLowerCase().includes(corridor.toLowerCase()) ||
                            item.destinationDistrict.toLowerCase().includes(corridor.toLowerCase());
          }

          // Vehicle Filter
          let matchVehicle = true;
          if (vehicle && vehicle !== '' && vehicle !== 'Tous véhicules') {
            matchVehicle = item.courierVehicle.toLowerCase().includes(vehicle.toLowerCase());
          }

          return matchTab && matchSearch && matchCorridor && matchVehicle;
        });
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

  closeIncident(deliveryId: string): void {
    const current = [...this.deliveriesSubject.value];
    const target = current.find(d => d.id === deliveryId);
    if (target) {
      target.isIncident = false;
      target.status = 'EN_ACHEMINEMENT';
      target.statusText = 'En acheminement';
      target.statusDotColor = 'blue';
      this.deliveriesSubject.next(current);
      if (this.selectedSubject.value?.id === deliveryId) {
        this.selectedSubject.next({ ...target });
      }
    }
  }
}
