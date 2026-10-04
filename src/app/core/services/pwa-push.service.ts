import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { BehaviorSubject, Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PushPreferences {
  push_rappels_planning: boolean;
  push_publications_video: boolean;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PwaPushService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private swPush = inject(SwPush, { optional: true });

  private baseUrl = environment.apiUrl ? `${environment.apiUrl}/api/notifications` : '/api/notifications';

  private isSubscribedSubject = new BehaviorSubject<boolean>(false);
  public isSubscribed$ = this.isSubscribedSubject.asObservable();

  private preferencesSubject = new BehaviorSubject<PushPreferences>({
    push_rappels_planning: true,
    push_publications_video: true
  });
  public preferences$ = this.preferencesSubject.asObservable();

  constructor() {
    this.initPushNotificationClicks();
    this.checkCurrentSubscriptionStatus();
  }

  /**
   * Initialise l'écouteur de clics sur les notifications Push pour la redirection vers les Deep Links.
   */
  private initPushNotificationClicks(): void {
    if (this.swPush && this.swPush.isEnabled) {
      this.swPush.notificationClicks.subscribe(event => {
        const targetUrl = event.notification?.data?.url || event.notification?.data?.gcm?.notification?.data?.url || '/';
        if (targetUrl) {
          this.router.navigateByUrl(targetUrl);
        }
      });
    }
  }

  /**
   * Vérifie si le navigateur possède déjà une souscription Web Push active.
   */
  checkCurrentSubscriptionStatus(): void {
    if (this.swPush && this.swPush.isEnabled) {
      this.swPush.subscription.subscribe(sub => {
        this.isSubscribedSubject.next(!!sub);
      });
    }
  }

  /**
   * Demande la clé publique VAPID depuis l'API backend.
   */
  getVapidPublicKey(): Observable<{ public_key: string }> {
    return this.http.get<{ public_key: string }>(`${this.baseUrl}/vapid-public-key/`).pipe(
      catchError(() => of({ public_key: '' }))
    );
  }

  /**
   * Déclenche l'invite d'autorisation PWA à la suite d'une action utilisateur explicite ("Activer les notifications").
   */
  subscribeToNotifications(): Promise<boolean> {
    if (!this.swPush || !this.swPush.isEnabled) {
      console.warn("Les notifications Service Worker ne sont pas disponibles sur ce navigateur.");
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      this.getVapidPublicKey().subscribe(({ public_key }) => {
        if (!public_key) {
          resolve(false);
          return;
        }

        this.swPush!.requestSubscription({
          serverPublicKey: public_key
        }).then(sub => {
          const subJson = sub.toJSON();
          const payload = {
            endpoint: sub.endpoint,
            keys: subJson.keys || {
              p256dh: subJson['p256dh'] || '',
              auth: subJson['auth'] || ''
            }
          };

          this.http.post(`${this.baseUrl}/push-subscribe/`, payload).subscribe({
            next: () => {
              this.isSubscribedSubject.next(true);
              resolve(true);
            },
            error: () => resolve(false)
          });
        }).catch(err => {
          console.error("Erreur d'abonnement Web Push :", err);
          resolve(false);
        });
      });
    });
  }

  /**
   * Désactive l'abonnement Web Push sur le navigateur et le backend.
   */
  unsubscribeFromNotifications(): Promise<boolean> {
    if (!this.swPush || !this.swPush.isEnabled) {
      return Promise.resolve(false);
    }

    return this.swPush.unsubscribe().then(() => {
      this.isSubscribedSubject.next(false);
      return true;
    }).catch(() => false);
  }

  /**
   * Récupère les préférences Push de l'utilisateur connecté.
   */
  getPreferences(): Observable<PushPreferences> {
    return this.http.get<PushPreferences>(`${this.baseUrl}/push-preferences/`).pipe(
      tap(prefs => this.preferencesSubject.next(prefs)),
      catchError(() => of(this.preferencesSubject.value))
    );
  }

  /**
   * Met à jour les préférences Push [ON/OFF] (Planning & Vidéos).
   */
  updatePreferences(prefs: Partial<PushPreferences>): Observable<PushPreferences> {
    return this.http.patch<PushPreferences>(`${this.baseUrl}/push-preferences/`, prefs).pipe(
      tap(updated => this.preferencesSubject.next(updated))
    );
  }
}
