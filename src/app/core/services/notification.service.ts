import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map, tap, catchError, of, interval, Subscription, filter } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface NotificationApiItem {
  id: number;
  type_notification: string;
  type_notification_display: string;
  canal: string;
  canal_display: string;
  titre: string;
  message: string;
  statut: string;
  statut_display: string;
  est_lu: boolean;
  date_lecture: string | null;
  reference_type: string;
  reference_id: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private baseUrl = environment.apiUrl ? `${environment.apiUrl}/api/notifications` : '/api/notifications';

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();
  private pollSub?: Subscription;

  constructor() {
    this.refreshUnreadCount();
    this.startPolling();
  }

  startPolling(): void {
    if (this.pollSub) return;
    this.pollSub = interval(12000).pipe(
      filter(() => this.authService.isAuthenticated())
    ).subscribe(() => {
      this.refreshUnreadCount();
    });
  }

  stopPolling(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = undefined;
  }


  /**
   * GET /api/notifications/
   */
  getNotifications(): Observable<NotificationApiItem[]> {
    return this.http.get<any>(`${this.baseUrl}/`).pipe(
      map(res => (Array.isArray(res) ? res : res?.results || [])),
      tap(items => {
        const unread = items.filter((n: NotificationApiItem) => !n.est_lu).length;
        this.unreadCountSubject.next(unread);
      }),
      catchError(() => of([]))
    );
  }

  /**
   * GET /api/notifications/unread-count/
   */
  getUnreadCount(): Observable<number> {
    return this.http.get<{ unread_count: number }>(`${this.baseUrl}/unread-count/`).pipe(
      map(res => res?.unread_count || 0),
      tap(count => this.unreadCountSubject.next(count)),
      catchError(() => of(0))
    );
  }

  /**
   * Rafraîchit le compteur de notifications non lues.
   */
  refreshUnreadCount(): void {
    this.getUnreadCount().subscribe();
  }

  /**
   * POST/PATCH /api/notifications/{id}/read/
   */
  markAsRead(id: number): Observable<NotificationApiItem> {
    return this.http.post<NotificationApiItem>(`${this.baseUrl}/${id}/read/`, {}).pipe(
      tap(() => this.refreshUnreadCount())
    );
  }

  /**
   * POST /api/notifications/mark-all-read/
   */
  markAllAsRead(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/mark-all-read/`, {}).pipe(
      tap(() => this.unreadCountSubject.next(0))
    );
  }
}
