import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdminUserDetail, UserFilterTab, UserStatsSummary } from '../models/admin-user.models';

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {
  private initialUsers: AdminUserDetail[] = [
    {
      id: '1',
      accountNumber: '#USR-84920',
      firstName: 'Awa',
      lastName: 'Ndiaye',
      email: 'awa.ndiaye@gmail.com',
      phone: '+221 77 450 12 34',
      accountTypeLabel: 'Client Gourmand',
      accountTypeSublabel: '(Particulier Dakar)',
      categoryGroup: 'CLIENT',
      status: 'ACTIF',
      address: 'Fann Résidence, Villa 12, Dakar',
      registrationDate: '14 Octobre 2024',
      lastActivity: 'Aujourd\'hui 13:42',
      ordersCount: 18,
      completedPercent: '100% complétées',
      totalSpent: 142500,
      totalSpentFormatted: '142 500',
      averageBasket: 7916,
      averageBasketFormatted: '7 916',
      preferredPaymentMethod: 'Wave',
      preferredPaymentPhone: '+221 77 450...',
      recentOrders: [
        {
          id: 'o-1',
          merchantName: 'Chez Tantie Marie',
          orderRef: '#AYY-1084',
          amount: 9500,
          amountFormatted: '9 500 FCFA',
          statusText: 'En cours',
          statusColor: 'orange'
        },
        {
          id: 'o-2',
          merchantName: 'Chez Loutcha',
          orderRef: '#AYY-0972',
          amount: 14000,
          amountFormatted: '14 000 FCFA',
          statusText: 'Livré',
          statusColor: 'green'
        },
        {
          id: 'o-3',
          merchantName: 'Teranga Palace',
          orderRef: '#AYY-0841',
          amount: 6500,
          amountFormatted: '6 500 FCFA',
          statusText: 'Livré',
          statusColor: 'green'
        }
      ]
    },
    {
      id: '2',
      accountNumber: '#USR-84921',
      firstName: 'Moussa',
      lastName: 'Diop',
      merchantName: 'Chez Loutcha',
      email: 'contact@loutcha.sn',
      phone: '+221 78 123 45 67',
      accountTypeLabel: 'Professionnel (Restaurant)',
      accountTypeSublabel: '(Restaurant Partenaire)',
      categoryGroup: 'PROFESSIONNEL',
      status: 'ACTIF',
      address: '101 Rue Raffenel, Dakar Plateau',
      registrationDate: '02 Mars 2024',
      lastActivity: 'Aujourd\'hui 14:10',
      ordersCount: 452,
      completedPercent: '98% complétées',
      totalSpent: 3850000,
      totalSpentFormatted: '3 850 000',
      averageBasket: 8517,
      averageBasketFormatted: '8 517',
      preferredPaymentMethod: 'Orange Money',
      preferredPaymentPhone: '+221 78 123...',
      recentOrders: [
        {
          id: 'o-4',
          merchantName: 'Chez Loutcha',
          orderRef: '#AYY-1083',
          amount: 4500,
          amountFormatted: '4 500 FCFA',
          statusText: 'En préparation',
          statusColor: 'orange'
        },
        {
          id: 'o-5',
          merchantName: 'Chez Loutcha',
          orderRef: '#AYY-1070',
          amount: 18500,
          amountFormatted: '18 500 FCFA',
          statusText: 'Livré',
          statusColor: 'green'
        }
      ]
    },
    {
      id: '3',
      accountNumber: '#USR-84922',
      firstName: 'Ibrahima',
      lastName: 'Faye',
      email: 'ibrahima.faye@gmail.com',
      phone: '+221 76 987 65 43',
      accountTypeLabel: 'Professionnel (Livreur / Flotte)',
      accountTypeSublabel: '(Coursier Moto Dakar)',
      categoryGroup: 'PROFESSIONNEL',
      status: 'ACTIF',
      address: 'Médina, Rue 22 x 15, Dakar',
      registrationDate: '10 Juin 2024',
      lastActivity: 'Aujourd\'hui 14:05',
      ordersCount: 310,
      completedPercent: '99% complétées',
      totalSpent: 0,
      totalSpentFormatted: '0',
      averageBasket: 0,
      averageBasketFormatted: '0',
      preferredPaymentMethod: 'Wave',
      preferredPaymentPhone: '+221 76 987...',
      recentOrders: []
    },
    {
      id: '4',
      accountNumber: '#USR-84923',
      firstName: 'Fatou Binetou',
      lastName: 'Seck',
      email: 'fatou.seck@orange.sn',
      phone: '+221 77 654 32 10',
      accountTypeLabel: 'Client Gourmand',
      accountTypeSublabel: '(Particulier Dakar)',
      categoryGroup: 'CLIENT',
      status: 'ACTIF',
      address: 'Mermoz Pyrotechnie, Dakar',
      registrationDate: '18 Septembre 2024',
      lastActivity: 'Hier 19:20',
      ordersCount: 12,
      completedPercent: '100% complétées',
      totalSpent: 94000,
      totalSpentFormatted: '94 000',
      averageBasket: 7833,
      averageBasketFormatted: '7 833',
      preferredPaymentMethod: 'Wave',
      preferredPaymentPhone: '+221 77 654...',
      recentOrders: []
    },
    {
      id: '5',
      accountNumber: '#USR-84924',
      firstName: 'Cheikh Tidiane',
      lastName: 'Sall',
      email: 'cheikh.sall@gmail.com',
      phone: '+221 77 890 12 34',
      accountTypeLabel: 'Client Gourmand',
      accountTypeSublabel: '(Particulier Dakar)',
      categoryGroup: 'CLIENT',
      status: 'DESACTIVE',
      address: 'Sacré-Cœur 3, Dakar',
      registrationDate: '05 Janvier 2024',
      lastActivity: 'Il y a 3 semaines',
      ordersCount: 4,
      completedPercent: '75% complétées',
      totalSpent: 28000,
      totalSpentFormatted: '28 000',
      averageBasket: 7000,
      averageBasketFormatted: '7 000',
      preferredPaymentMethod: 'Cash',
      preferredPaymentPhone: '-',
      recentOrders: []
    },
    {
      id: '6',
      accountNumber: '#USR-84925',
      firstName: 'Oumar',
      lastName: 'Diallo',
      merchantName: 'Burger Black Bun',
      email: 'oumar.diallo@bun.sn',
      phone: '+221 70 345 67 89',
      accountTypeLabel: 'Professionnel (Commerce)',
      accountTypeSublabel: '(Fast-Food Partenaire)',
      categoryGroup: 'PROFESSIONNEL',
      status: 'ACTIF',
      address: 'Almadies Route des Almadies, Dakar',
      registrationDate: '22 Avril 2024',
      lastActivity: 'Aujourd\'hui 12:30',
      ordersCount: 184,
      completedPercent: '97% complétées',
      totalSpent: 1240000,
      totalSpentFormatted: '1 240 000',
      averageBasket: 6739,
      averageBasketFormatted: '6 739',
      preferredPaymentMethod: 'Wave',
      preferredPaymentPhone: '+221 70 345...',
      recentOrders: []
    },
    {
      id: '7',
      accountNumber: '#USR-84926',
      firstName: 'Mariama',
      lastName: 'Ba',
      email: 'mariama.ba@teranga.sn',
      phone: '+221 77 321 09 87',
      accountTypeLabel: 'Client Gourmand',
      accountTypeSublabel: '(Particulier Dakar)',
      categoryGroup: 'CLIENT',
      status: 'ACTIF',
      address: 'Ngor Virage, Villa 8, Dakar',
      registrationDate: '11 Août 2024',
      lastActivity: 'Aujourd\'hui 11:15',
      ordersCount: 29,
      completedPercent: '100% complétées',
      totalSpent: 245000,
      totalSpentFormatted: '245 000',
      averageBasket: 8448,
      averageBasketFormatted: '8 448',
      preferredPaymentMethod: 'Wave',
      preferredPaymentPhone: '+221 77 321...',
      recentOrders: []
    },
    {
      id: '8',
      accountNumber: '#USR-84927',
      firstName: 'Modou',
      lastName: 'Fall',
      email: 'modou.fall@livreur.ayyou.sn',
      phone: '+221 78 555 44 33',
      accountTypeLabel: 'Professionnel (Livreur / Flotte)',
      accountTypeSublabel: '(Flotte Indépendante)',
      categoryGroup: 'PROFESSIONNEL',
      status: 'ACTIF',
      address: 'Parcelles Assainies U25, Dakar',
      registrationDate: '01 Février 2024',
      lastActivity: 'Aujourd\'hui 13:58',
      ordersCount: 612,
      completedPercent: '99% complétées',
      totalSpent: 0,
      totalSpentFormatted: '0',
      averageBasket: 0,
      averageBasketFormatted: '0',
      preferredPaymentMethod: 'Orange Money',
      preferredPaymentPhone: '+221 78 555...',
      recentOrders: []
    }
  ];

  private usersSubject = new BehaviorSubject<AdminUserDetail[]>(this.initialUsers);
  private selectedUserSubject = new BehaviorSubject<AdminUserDetail | null>(this.initialUsers[0]);

  users$ = this.usersSubject.asObservable();
  selectedUser$ = this.selectedUserSubject.asObservable();

  getStatsSummary(): Observable<UserStatsSummary> {
    return of({
      total: 24580,
      clients: 24140,
      professionals: 440,
      active: 24395,
      disabled: 185
    });
  }

  selectUser(user: AdminUserDetail): void {
    this.selectedUserSubject.next(user);
  }

  toggleUserStatus(userId: string): void {
    const updated = this.usersSubject.getValue().map(u => {
      if (u.id === userId) {
        const newStatus = u.status === 'ACTIF' ? ('DESACTIVE' as const) : ('ACTIF' as const);
        return { ...u, status: newStatus };
      }
      return u;
    });
    this.usersSubject.next(updated);

    const currentSelected = this.selectedUserSubject.getValue();
    if (currentSelected && currentSelected.id === userId) {
      const updatedSelected = updated.find(u => u.id === userId) || null;
      this.selectedUserSubject.next(updatedSelected);
    }
  }

  filterUsers(tab: UserFilterTab, searchQuery: string): Observable<AdminUserDetail[]> {
    return this.users$.pipe(
      map(users => {
        return users.filter(user => {
          // Tab match
          let matchTab = true;
          if (tab === 'CLIENTS') matchTab = user.categoryGroup === 'CLIENT';
          else if (tab === 'PROFESSIONALS') matchTab = user.categoryGroup === 'PROFESSIONNEL';
          else if (tab === 'ACTIVE') matchTab = user.status === 'ACTIF';
          else if (tab === 'DISABLED') matchTab = user.status === 'DESACTIVE';

          // Search query match
          let matchSearch = true;
          if (searchQuery && searchQuery.trim().length > 0) {
            const q = searchQuery.toLowerCase().trim();
            const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
            const email = user.email.toLowerCase();
            const phone = user.phone.toLowerCase();
            const accNum = user.accountNumber.toLowerCase();
            const merchant = user.merchantName ? user.merchantName.toLowerCase() : '';

            matchSearch = fullName.includes(q) ||
                          email.includes(q) ||
                          phone.includes(q) ||
                          accNum.includes(q) ||
                          merchant.includes(q);
          }

          return matchTab && matchSearch;
        });
      })
    );
  }
}
