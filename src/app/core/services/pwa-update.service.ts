import { inject, Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PwaUpdateService {
  private swUpdate = inject(SwUpdate, { optional: true });

  constructor() {
    if (this.swUpdate && this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
      ).subscribe(() => {
        if (confirm("Une nouvelle version d'AYYOU est disponible. Voulez-vous la charger maintenant ?")) {
          window.location.reload();
        }
      });
    }
  }

  /**
   * Vérification manuelle de la disponibilité d'une mise à jour PWA.
   */
  checkForUpdate(): Promise<boolean> {
    if (this.swUpdate && this.swUpdate.isEnabled) {
      return this.swUpdate.checkForUpdate();
    }
    return Promise.resolve(false);
  }
}
