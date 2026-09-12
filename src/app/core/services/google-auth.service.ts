import { Injectable, inject } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GoogleUserAccount {
  sub: string;
  email: string;
  name: string;
  givenName: string;
  familyName: string;
  picture?: string;
  initials: string;
}

export interface GoogleCredentialResponse {
  credential: string;
  user: GoogleUserAccount;
}

declare global {
  interface Window {
    google?: any;
    onGoogleLibraryLoad?: () => void;
  }
}

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private scriptLoaded = false;
  private credentialSubject = new Subject<GoogleCredentialResponse>();
  public credential$ = this.credentialSubject.asObservable();

  loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.scriptLoaded || window.google?.accounts?.id) {
        this.scriptLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };
      script.onerror = (err) => reject(err);
      document.head.appendChild(script);
    });
  }

  initialize(callback?: (response: GoogleCredentialResponse) => void): void {
    if (!window.google?.accounts?.id) {
      return;
    }

    const clientId = environment.googleClientId || 'YOUR_GOOGLE_CLIENT_ID';

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (res: any) => {
        if (res && res.credential) {
          const user = this.decodeToken(res.credential);
          const result: GoogleCredentialResponse = {
            credential: res.credential,
            user
          };
          if (callback) {
            callback(result);
          }
          this.credentialSubject.next(result);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true
    });
  }

  prompt(): void {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  }

  renderButton(element: HTMLElement): void {
    if (window.google?.accounts?.id && element) {
      window.google.accounts.id.renderButton(element, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 320
      });
    }
  }

  decodeToken(token: string): GoogleUserAccount {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);

      const givenName = payload.given_name || payload.name?.split(' ')[0] || '';
      const familyName = payload.family_name || payload.name?.split(' ').slice(1).join(' ') || '';
      const initials = (givenName[0] || '') + (familyName[0] || givenName[1] || '');

      return {
        sub: payload.sub || '',
        email: payload.email || '',
        name: payload.name || `${givenName} ${familyName}`.trim(),
        givenName,
        familyName,
        picture: payload.picture,
        initials: initials.toUpperCase()
      };
    } catch {
      return {
        sub: '',
        email: '',
        name: 'Utilisateur',
        givenName: 'Utilisateur',
        familyName: '',
        initials: 'U'
      };
    }
  }
}
