import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  EstablishmentDetail,
  EstablishmentFilterTab,
  EstablishmentStatsSummary
} from '../models/admin-business.models';

@Injectable({
  providedIn: 'root'
})
export class AdminBusinessService {
  private initialEstablishments: EstablishmentDetail[] = [
    {
      id: 'b-1',
      name: 'Le Relais de la Corniche',
      ownerFirstName: 'Moussa',
      ownerLastName: 'Diop',
      phone: '+221 78 123 45 67',
      type: 'RESTAURANT',
      category: 'Cuisine sénégalaise',
      subCategory: 'Table gastronomique',
      neighborhood: 'Corniche Ouest',
      address: 'Corniche Ouest, Dakar',
      performanceText: 'Nouveau • 0 commande',
      ordersCount: 0,
      status: 'EN_ATTENTE',
      submittedAt: 'Soumis le 23 Octobre 2024 • 14:15',
      commissionRate: '12.0% convenu',
      logoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&auto=format&fit=crop&q=80',
      documentsCount: '4/4 Fichiers',
      documents: [
        {
          id: 'doc-1',
          title: 'RCCM',
          documentRef: 'SN-DKR-2023-B-145',
          subtitle: 'Authentifié Greffe Dakar',
          iconType: 'eye'
        },
        {
          id: 'doc-2',
          title: 'NINEA',
          documentRef: '008492012 / 2V3',
          subtitle: 'Attestation fiscale conforme',
          iconType: 'eye'
        },
        {
          id: 'doc-3',
          title: 'Certificat Hygiène & Salubrité',
          documentRef: 'Service Régional 2024',
          subtitle: 'Délivré Services Régionaux 2024',
          iconType: 'download'
        },
        {
          id: 'doc-4',
          title: 'Compte Wave Business Certifié',
          documentRef: 'Wave SARL',
          subtitle: 'Titulaire : Le Relais de la Corniche SARL',
          iconType: 'check'
        }
      ],
      photos: [
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=300&auto=format&fit=crop&q=80'
      ]
    },
    {
      id: 'b-2',
      name: 'Chez Loutcha',
      ownerFirstName: 'Loutcha',
      ownerLastName: 'C.',
      phone: '+221 77 541 20 90',
      type: 'RESTAURANT',
      category: 'Sénégalo-Capverdien',
      subCategory: 'Plats du jour & Thiéb',
      neighborhood: 'Plateau',
      address: '101 Rue Raffenel, Dakar Plateau',
      performanceText: '2 840 commandes',
      ordersCount: 2840,
      status: 'ACTIF',
      submittedAt: 'Approuvé le 15 Mars 2024',
      commissionRate: '15.0% standard',
      logoUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=100&auto=format&fit=crop&q=80',
      documentsCount: '4/4 Fichiers',
      documents: [
        { id: 'doc-5', title: 'RCCM', documentRef: 'SN-DKR-2020-B-891', subtitle: 'Valide', iconType: 'eye' },
        { id: 'doc-6', title: 'NINEA', documentRef: '001293810 / 1A2', subtitle: 'Attestation conforme', iconType: 'eye' }
      ],
      photos: [
        'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&auto=format&fit=crop&q=80'
      ]
    },
    {
      id: 'b-3',
      name: 'Burger Black Bun',
      ownerFirstName: 'Kader',
      ownerLastName: 'Kane',
      phone: '+221 77 892 11 34',
      type: 'RESTAURANT',
      category: 'Fast Food Braisé',
      subCategory: 'Burgers & Frites maison',
      neighborhood: 'Almadies',
      address: 'Route des Almadies, Dakar',
      performanceText: '1 920 commandes',
      ordersCount: 1920,
      status: 'ACTIF',
      submittedAt: 'Approuvé le 02 Juin 2024',
      commissionRate: '14.0% convenu',
      logoUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&auto=format&fit=crop&q=80',
      documentsCount: '4/4 Fichiers',
      documents: [],
      photos: []
    },
    {
      id: 'b-4',
      name: 'Touba Primeurs & Bio',
      ownerFirstName: 'Serigne',
      ownerLastName: 'Fall',
      phone: '+221 76 601 99 82',
      type: 'VENDEUR',
      category: 'Commerce & Primeur',
      subCategory: 'Fruits, Légumes & Épices',
      neighborhood: 'Mermoz',
      address: 'Avenue Cheikh Anta Diop, Mermoz',
      performanceText: '740 commandes',
      ordersCount: 740,
      status: 'ACTIF',
      submittedAt: 'Approuvé le 10 Juillet 2024',
      commissionRate: '10.0% commerce',
      logoUrl: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=100&auto=format&fit=crop&q=80',
      documentsCount: '4/4 Fichiers',
      documents: [],
      photos: []
    },
    {
      id: 'b-5',
      name: 'L\'Atelier du Choucouya',
      ownerFirstName: 'Awa',
      ownerLastName: 'Diallo',
      phone: '+221 77 217 32 80',
      type: 'RESTAURANT',
      category: 'Grillades & Braisés',
      subCategory: 'Agneau, Dibiterie chic',
      neighborhood: 'Ouakam',
      address: 'Cité Avion, Ouakam',
      performanceText: '1 510 commandes',
      ordersCount: 1510,
      status: 'ACTIF',
      submittedAt: 'Approuvé le 18 Janvier 2024',
      commissionRate: '12.5% convenu',
      logoUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=100&auto=format&fit=crop&q=80',
      documentsCount: '4/4 Fichiers',
      documents: [],
      photos: []
    },
    {
      id: 'b-6',
      name: 'Chez Tantie Marie',
      ownerFirstName: 'Marie',
      ownerLastName: 'Sagna',
      phone: '+221 77 444 19 82',
      type: 'RESTAURANT',
      category: 'Cuisine Familiale',
      subCategory: 'Yassa, Maffé, Soupe Kandia',
      neighborhood: 'Ngor',
      address: 'Plage de Ngor, Dakar',
      performanceText: '830 commandes',
      ordersCount: 830,
      status: 'ACTIF',
      submittedAt: 'Approuvé le 05 Mai 2024',
      commissionRate: '13.0% convenu',
      logoUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&auto=format&fit=crop&q=80',
      documentsCount: '4/4 Fichiers',
      documents: [],
      photos: []
    },
    {
      id: 'b-7',
      name: 'Dakar Sweets & Pastry',
      ownerFirstName: 'Alioune',
      ownerLastName: 'Badara',
      phone: '+221 77 110 50 33',
      type: 'VENDEUR',
      category: 'Pâtisserie Fine',
      subCategory: 'Gâteaux & Viennoiseries',
      neighborhood: 'Point E',
      address: 'Rue de Louga, Point E',
      performanceText: '210 commandes',
      ordersCount: 210,
      status: 'ACTIF',
      submittedAt: 'Approuvé le 12 Septembre 2024',
      commissionRate: '11.0% pâtisserie',
      logoUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100&auto=format&fit=crop&q=80',
      documentsCount: '4/4 Fichiers',
      documents: [],
      photos: []
    }
  ];

  private establishmentsSubject = new BehaviorSubject<EstablishmentDetail[]>(this.initialEstablishments);
  private selectedSubject = new BehaviorSubject<EstablishmentDetail | null>(this.initialEstablishments[0]);

  establishments$ = this.establishmentsSubject.asObservable();
  selectedEstablishment$ = this.selectedSubject.asObservable();

  getStatsSummary(): Observable<EstablishmentStatsSummary> {
    return of({
      total: 259,
      totalSubtext: '+14 ce mois-ci',
      activeRestaurants: 185,
      activeRestaurantsSubtext: 'Cuisine sénégalaise, braisés',
      commercesAndSellers: 74,
      commercesAndSellersSubtext: 'Épiceries, primeurs, traiteurs',
      pendingApproval: 8,
      pendingApprovalSubtext: 'Dossiers NINEA à vérifier',
      monthlyVolume: '148,5M FCFA',
      monthlyVolumeSubtext: 'Sur les 30 derniers jours'
    });
  }

  selectEstablishment(item: EstablishmentDetail): void {
    this.selectedSubject.next(item);
  }

  approveEstablishment(id: string): void {
    const updated = this.establishmentsSubject.getValue().map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: 'ACTIF' as const,
          performanceText: 'Approuvé • 0 commande'
        };
      }
      return item;
    });
    this.establishmentsSubject.next(updated);

    const currentSelected = this.selectedSubject.getValue();
    if (currentSelected && currentSelected.id === id) {
      const updatedSelected = updated.find(i => i.id === id) || null;
      this.selectedSubject.next(updatedSelected);
    }
  }

  rejectEstablishment(id: string): void {
    const updated = this.establishmentsSubject.getValue().map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: 'REJETE' as const,
          performanceText: 'Dossier rejeté'
        };
      }
      return item;
    });
    this.establishmentsSubject.next(updated);

    const currentSelected = this.selectedSubject.getValue();
    if (currentSelected && currentSelected.id === id) {
      const updatedSelected = updated.find(i => i.id === id) || null;
      this.selectedSubject.next(updatedSelected);
    }
  }

  filterEstablishments(tab: EstablishmentFilterTab, neighborhood: string): Observable<EstablishmentDetail[]> {
    return this.establishments$.pipe(
      map(items => {
        return items.filter(item => {
          // Tab filter
          let matchTab = true;
          if (tab === 'RESTAURANTS') matchTab = item.type === 'RESTAURANT';
          else if (tab === 'VENDEURS') matchTab = item.type === 'VENDEUR';
          else if (tab === 'PENDING') matchTab = item.status === 'EN_ATTENTE';

          // Neighborhood filter
          let matchNeighborhood = true;
          if (neighborhood && neighborhood !== 'ALL' && neighborhood !== 'Tous les quartiers') {
            matchNeighborhood = item.neighborhood.toLowerCase() === neighborhood.toLowerCase();
          }

          return matchTab && matchNeighborhood;
        });
      })
    );
  }
}
