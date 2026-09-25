import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AdminUserDetail, UserFilterTab, UserStatsSummary } from '../models/admin-user.models';
import { environment } from '../../../../environments/environment';

function mapBackendUserToAdminUserDetail(u: any): AdminUserDetail {
  const isPro = (u.nombre_etablissements && u.nombre_etablissements > 0) ||
                (u.statut_livreur !== null && u.statut_livreur !== undefined) ||
                (u.roles && Array.isArray(u.roles) && u.roles.some((r: string) => ['RESTAURANT', 'VENDEUR', 'LIVREUR'].includes(r.toUpperCase())));

  let accountTypeLabel = 'Client Gourmand';
  let accountTypeSublabel = '(Particulier Dakar)';

  if (u.roles && u.roles.includes('ADMINISTRATEUR')) {
    accountTypeLabel = 'Administrateur';
    accountTypeSublabel = '(Super Admin)';
  } else if ((u.statut_livreur !== null && u.statut_livreur !== undefined) || (u.roles && u.roles.includes('LIVREUR'))) {
    accountTypeLabel = 'Professionnel (Livreur / Flotte)';
    accountTypeSublabel = u.statut_livreur ? `(Statut: ${u.statut_livreur})` : '(Coursier Moto)';
  } else if ((u.nombre_etablissements && u.nombre_etablissements > 0) || (u.roles && (u.roles.includes('RESTAURANT') || u.roles.includes('VENDEUR')))) {
    accountTypeLabel = 'Professionnel (Restaurant / Commerce)';
    accountTypeSublabel = `(${u.nombre_etablissements || 1} établissement(s))`;
  }

  const regDate = u.date_creation 
    ? new Date(u.date_creation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Date inconnue';
    
  const lastAct = u.derniere_connexion
    ? new Date(u.derniere_connexion).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : 'Récemment';

  return {
    id: u.id ? u.id.toString() : '',
    accountNumber: `#USR-${u.id}`,
    firstName: u.prenom || '',
    lastName: u.nom || '',
    email: u.email || '',
    phone: u.numero_telephone || '',
    accountTypeLabel,
    accountTypeSublabel,
    categoryGroup: isPro ? 'PROFESSIONNEL' : 'CLIENT',
    status: u.est_actif ? 'ACTIF' : 'DESACTIVE',
    address: 'Dakar, Sénégal',
    registrationDate: regDate,
    lastActivity: lastAct,
    ordersCount: 0,
    completedPercent: '100% complétées',
    totalSpent: 0,
    totalSpentFormatted: '0',
    averageBasket: 0,
    averageBasketFormatted: '0',
    preferredPaymentMethod: 'Wave',
    preferredPaymentPhone: u.numero_telephone || '',
    recentOrders: []
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {
  private http = inject(HttpClient);

  private usersSubject = new BehaviorSubject<AdminUserDetail[]>([]);
  private selectedUserSubject = new BehaviorSubject<AdminUserDetail | null>(null);

  users$ = this.usersSubject.asObservable();
  selectedUser$ = this.selectedUserSubject.asObservable();

  getStatsSummary(): Observable<UserStatsSummary> {
    const url = `${environment.apiUrl}/api/admin/users/`;
    return this.http.get<any>(url).pipe(
      map(res => {
        const rawUsers: any[] = Array.isArray(res) ? res : (res.results || []);
        const users = rawUsers.map(mapBackendUserToAdminUserDetail);
        
        const total = users.length;
        const clients = users.filter(u => u.categoryGroup === 'CLIENT').length;
        const professionals = users.filter(u => u.categoryGroup === 'PROFESSIONNEL').length;
        const active = users.filter(u => u.status === 'ACTIF').length;
        const disabled = users.filter(u => u.status === 'DESACTIVE').length;

        return { total, clients, professionals, active, disabled };
      }),
      catchError(() => of({
        total: 0,
        clients: 0,
        professionals: 0,
        active: 0,
        disabled: 0
      }))
    );
  }

  selectUser(user: AdminUserDetail): void {
    this.selectedUserSubject.next(user);
  }

  toggleUserStatus(userId: string): Observable<AdminUserDetail | null> {
    const url = `${environment.apiUrl}/api/admin/users/${userId}/toggle-status/`;
    return this.http.patch<any>(url, {}).pipe(
      map(raw => {
        const updatedUser = mapBackendUserToAdminUserDetail(raw);
        const currentList = this.usersSubject.getValue().map(u => u.id === userId ? updatedUser : u);
        this.usersSubject.next(currentList);

        const currentSel = this.selectedUserSubject.getValue();
        if (currentSel && currentSel.id === userId) {
          this.selectedUserSubject.next(updatedUser);
        }
        return updatedUser;
      }),
      catchError(err => {
        console.error('Erreur toggle status utilisateur:', err);
        return of(null);
      })
    );
  }

  assignRole(userId: string, role: string): Observable<AdminUserDetail | null> {
    const url = `${environment.apiUrl}/api/admin/users/${userId}/assign-role/`;
    return this.http.post<any>(url, { role }).pipe(
      map(raw => {
        const updatedUser = mapBackendUserToAdminUserDetail(raw);
        const currentList = this.usersSubject.getValue().map(u => u.id === userId ? updatedUser : u);
        this.usersSubject.next(currentList);

        const currentSel = this.selectedUserSubject.getValue();
        if (currentSel && currentSel.id === userId) {
          this.selectedUserSubject.next(updatedUser);
        }
        return updatedUser;
      }),
      catchError(err => {
        console.error('Erreur assignation rôle utilisateur:', err);
        return of(null);
      })
    );
  }

  filterUsers(tab: UserFilterTab, searchQuery: string): Observable<AdminUserDetail[]> {
    let params = new HttpParams();

    if (searchQuery && searchQuery.trim().length > 0) {
      params = params.set('search', searchQuery.trim());
    }

    if (tab === 'ACTIVE') {
      params = params.set('est_actif', 'true');
    } else if (tab === 'DISABLED') {
      params = params.set('est_actif', 'false');
    }

    const url = `${environment.apiUrl}/api/admin/users/`;

    return this.http.get<any>(url, { params }).pipe(
      map(res => {
        const rawUsers: any[] = Array.isArray(res) ? res : (res.results || []);
        let users = rawUsers.map(mapBackendUserToAdminUserDetail);

        if (tab === 'CLIENTS') {
          users = users.filter(u => u.categoryGroup === 'CLIENT');
        } else if (tab === 'PROFESSIONALS') {
          users = users.filter(u => u.categoryGroup === 'PROFESSIONNEL');
        }

        this.usersSubject.next(users);

        const currentSel = this.selectedUserSubject.getValue();
        if (users.length > 0) {
          if (!currentSel || !users.some(u => u.id === currentSel.id)) {
            this.selectedUserSubject.next(users[0]);
          }
        } else {
          this.selectedUserSubject.next(null);
        }

        return users;
      }),
      catchError(err => {
        console.error('Erreur chargement utilisateurs admin:', err);
        return of([]);
      })
    );
  }
}
