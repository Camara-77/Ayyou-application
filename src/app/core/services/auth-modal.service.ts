import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AuthModalConfig {
  title?: string;
  message?: string;
  confirmText?: string;
  registerText?: string;
  cancelText?: string;
  actionType?: 'like' | 'cart' | 'order' | 'profile' | 'favorites' | 'history' | 'generic';
  actionPayload?: any;
  returnUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthModalService {
  private isOpenSubject = new BehaviorSubject<boolean>(false);
  isOpen$: Observable<boolean> = this.isOpenSubject.asObservable();

  private configSubject = new BehaviorSubject<AuthModalConfig>({});
  config$: Observable<AuthModalConfig> = this.configSubject.asObservable();

  openModal(config: AuthModalConfig = {}): void {
    const defaultConfig: AuthModalConfig = {
      title: 'Connectez-vous pour continuer',
      message: 'Créez un compte ou connectez-vous pour accéder à toutes les fonctionnalités AYYOU.',
      confirmText: 'Se connecter',
      registerText: 'Créer un compte',
      cancelText: 'Continuer à explorer',
      actionType: 'generic'
    };

    const finalConfig = { ...defaultConfig, ...config };

    if (finalConfig.actionType) {
      this.savePendingAction(finalConfig);
    }

    this.configSubject.next(finalConfig);
    this.isOpenSubject.next(true);
  }

  closeModal(): void {
    this.isOpenSubject.next(false);
  }

  savePendingAction(config: AuthModalConfig): void {
    try {
      sessionStorage.setItem('ayyou_pending_action', JSON.stringify({
        type: config.actionType,
        payload: config.actionPayload,
        returnUrl: config.returnUrl || window.location.pathname
      }));
    } catch {}
  }

  getPendingAction(): { type?: string; payload?: any; returnUrl?: string } | null {
    try {
      const item = sessionStorage.getItem('ayyou_pending_action');
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  clearPendingAction(): void {
    sessionStorage.removeItem('ayyou_pending_action');
  }
}
