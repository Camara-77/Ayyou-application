import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DriverDetail, DriverFilterTab, DriverStatsSummary } from '../models/admin-driver.models';

@Injectable({
  providedIn: 'root'
})
export class AdminDriverService {
  private initialDrivers: DriverDetail[] = [
    {
      id: 'd-1',
      firstName: 'Ibrahima',
      lastName: 'Sow',
      initials: 'IS',
      licensePlate: 'DK-8492-AB',
      phone: '+221 77 450 11 22',
      email: 'i.sow@ayyou.sn',
      zone: 'Plateau / Médina',
      vehicle: 'Yamaha Crypton 110',
      vehicleDeclaredFull: 'Yamaha Crypton 110cc (DK-8492-AB)',
      status: 'EN_LIVRAISON',
      statusText: '• En livraison',
      currentMissionRef: '#AYY-1089',
      currentMissionTitle: 'Chez Loutcha ➔ Point E (8 min)'
    },
    {
      id: 'd-2',
      firstName: 'Modou',
      lastName: 'Fall',
      initials: 'MF',
      licensePlate: 'DK-2041-C',
      phone: '+221 78 555 44 33',
      email: 'm.fall@ayyou.sn',
      zone: 'Almadies / Ngor',
      vehicle: 'Boxer 150',
      vehicleDeclaredFull: 'Boxer 150cc (DK-2041-C)',
      status: 'DISPONIBLE',
      statusText: '• Disponible',
      currentMissionTitle: 'En attente d\'attribution'
    },
    {
      id: 'd-3',
      firstName: 'Cheikh',
      lastName: 'Ndiaye',
      initials: 'CN',
      licensePlate: 'DK-5512-AZ',
      phone: '+221 76 333 22 11',
      email: 'c.ndiaye@ayyou.sn',
      zone: 'Ouakam / Mermoz',
      vehicle: 'Kymco Agility 125',
      vehicleDeclaredFull: 'Kymco Agility 125cc (DK-5512-AZ)',
      status: 'RECUPERATION',
      statusText: '• Récupération',
      currentMissionRef: '#AYY-1092',
      currentMissionTitle: 'Chez Burger Black Bun (Au resto)'
    },
    {
      id: 'd-4',
      firstName: 'Babacar',
      lastName: 'Diop',
      initials: 'BD',
      licensePlate: 'DK-9923-BA',
      phone: '+221 77 999 88 77',
      email: 'b.diop@ayyou.sn',
      zone: 'Maristes / Hann',
      vehicle: 'TVS HLX 150',
      vehicleDeclaredFull: 'TVS HLX 150cc (DK-9923-BA)',
      status: 'EN_LIVRAISON',
      statusText: '• En livraison',
      currentMissionRef: '#AYY-1085',
      currentMissionTitle: 'En route (Hann Maristes 2)'
    },
    {
      id: 'd-5',
      firstName: 'Ousmane',
      lastName: 'Kane',
      initials: 'OK',
      licensePlate: 'DK-1120-X',
      phone: '+221 70 111 22 33',
      email: 'o.kane@ayyou.sn',
      zone: 'Fann Résidence',
      vehicle: 'Yamaha 125',
      vehicleDeclaredFull: 'Yamaha 125cc (DK-1120-X)',
      status: 'HORS_LIGNE',
      statusText: '• Hors ligne',
      currentMissionTitle: 'Fin de service 13:45'
    },
    {
      id: 'd-6',
      firstName: 'Alioune Badara',
      lastName: 'Seck',
      initials: 'AS',
      licensePlate: 'Nouveau postulant',
      phone: '+221 77 821 44 90',
      email: 'a.seck@gmail.com',
      zone: 'Parcelles Assainies',
      vehicle: 'Yamaha YBR 125',
      vehicleDeclaredFull: 'Yamaha YBR 125cc (SN-DK-7718-BC)',
      status: 'DOSSIER_A_VALIDER',
      statusText: '• Dossier à valider',
      currentMissionTitle: 'Instruction en cours',
      isCandidate: true,
      submittedAt: 'Soumis le 14 Mai 2024 • 16:30',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      documentsCount: '4/4',
      documents: [
        { id: 'doc-d1', title: 'CNI / Pièce d\'identité', subtitle: 'Recto / Verso validé', isValidated: true },
        { id: 'doc-d2', title: 'Permis de conduire', subtitle: 'Catégorie A • Exp. 2027', isValidated: true },
        { id: 'doc-d3', title: 'Casier judiciaire (B3)', subtitle: 'Tribunal Dakar < 3 mois', isValidated: true },
        { id: 'doc-d4', title: 'Carte grise & Assurance', subtitle: 'Attestation AXA en règle', isValidated: true }
      ]
    }
  ];

  private driversSubject = new BehaviorSubject<DriverDetail[]>(this.initialDrivers);
  private selectedSubject = new BehaviorSubject<DriverDetail | null>(this.initialDrivers[5]); // Select candidate by default

  drivers$ = this.driversSubject.asObservable();
  selectedDriver$ = this.selectedSubject.asObservable();

  getStatsSummary(): Observable<DriverStatsSummary> {
    return of({
      connectedCount: 148,
      connectedSubtext: 'En heure de pointe',
      availableCount: 52,
      availableSubtext: 'En attente d\'assignation',
      deliveringCount: 96,
      deliveringSubtext: 'Courses en cours',
      offlineCount: 42,
      offlineSubtext: 'Inactifs ou repos',
      applicationsCount: 6,
      applicationsSubtext: 'Dossiers à vérifier'
    });
  }

  selectDriver(item: DriverDetail): void {
    this.selectedSubject.next(item);
  }

  approveCandidate(id: string): void {
    const updated = this.driversSubject.getValue().map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: 'DISPONIBLE' as const,
          statusText: '• Disponible',
          currentMissionTitle: 'En attente d\'attribution',
          isCandidate: false
        };
      }
      return item;
    });
    this.driversSubject.next(updated);

    const currentSelected = this.selectedSubject.getValue();
    if (currentSelected && currentSelected.id === id) {
      const updatedSelected = updated.find(i => i.id === id) || null;
      this.selectedSubject.next(updatedSelected);
    }
  }

  rejectCandidate(id: string): void {
    const updated = this.driversSubject.getValue().filter(item => item.id !== id);
    this.driversSubject.next(updated);
    if (this.selectedSubject.getValue()?.id === id) {
      this.selectedSubject.next(updated[0] || null);
    }
  }

  filterDrivers(tab: DriverFilterTab, zone: string, vehicleType: string): Observable<DriverDetail[]> {
    return this.drivers$.pipe(
      map(items => {
        return items.filter(item => {
          // Tab filter
          let matchTab = true;
          if (tab === 'DISPONIBLE') matchTab = item.status === 'DISPONIBLE';
          else if (tab === 'EN_LIVRAISON') matchTab = item.status === 'EN_LIVRAISON' || item.status === 'RECUPERATION';
          else if (tab === 'HORS_LIGNE') matchTab = item.status === 'HORS_LIGNE';

          // Zone filter
          let matchZone = true;
          if (zone && zone !== 'ALL' && zone !== 'Toutes les zones') {
            matchZone = item.zone.toLowerCase().includes(zone.toLowerCase());
          }

          // Vehicle filter
          let matchVehicle = true;
          if (vehicleType && vehicleType !== 'ALL' && vehicleType !== 'Type de véhicule (Tous)') {
            matchVehicle = item.vehicle.toLowerCase().includes(vehicleType.toLowerCase());
          }

          return matchTab && matchZone && matchVehicle;
        });
      })
    );
  }
}
