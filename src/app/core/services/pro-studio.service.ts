import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { ProVideoUpload } from '../models/pro';
import { ProfessionalService } from './professional.service';

@Injectable({
  providedIn: 'root'
})
export class ProStudioService {
  private professionalService = inject(ProfessionalService);

  private videosSubject = new BehaviorSubject<ProVideoUpload[]>([]);
  videos$: Observable<ProVideoUpload[]> = this.videosSubject.asObservable();

  constructor() {}

  get videos(): ProVideoUpload[] {
    return this.videosSubject.value;
  }

  getVideos(): ProVideoUpload[] {
    return this.videosSubject.value;
  }

  loadFeedPublications(etabId?: number): Observable<ProVideoUpload[]> {
    return this.professionalService.getFeedPublications(etabId).pipe(
      map(pubs => (pubs || []).map(p => this.mapBackendToProVideo(p))),
      tap(vids => {
        this.videosSubject.next(vids);
      }),
      catchError(() => {
        this.videosSubject.next([]);
        return of([]);
      })
    );
  }

  mapBackendToProVideo(pub: any): ProVideoUpload {
    const pNom = pub.produit ? (typeof pub.produit === 'object' ? pub.produit.nom : pub.produit_nom || 'Plat AYYOU') : (pub.produit_nom || 'Plat AYYOU');
    const etabNom = pub.etablissement ? (typeof pub.etablissement === 'object' ? pub.etablissement.nom : pub.etablissement_nom || '') : '';
    
    // Génération de la miniature réelle Cloudinary depuis l'URL de la vidéo
    let thumb = pub.produit && typeof pub.produit === 'object' ? pub.produit.image_url : pub.produit_detail?.image_url;
    if (pub.media_url && typeof pub.media_url === 'string' && pub.media_url.includes('cloudinary.com')) {
      thumb = pub.media_url.replace(/\.(mp4|mov|webm|avi|mkv)$/i, '.jpg');
    }
    if (!thumb) {
      thumb = pub.media_url || '';
    }

    const titleStr = etabNom ? (pNom !== 'Plat AYYOU' ? `${pNom} — ${etabNom}` : etabNom) : pNom;

    return {
      id: pub.id ? pub.id.toString() : 'v_' + Date.now(),
      videoUrl: pub.media_url || '',
      thumbnailUrl: thumb,
      dishId: pub.produit ? (typeof pub.produit === 'object' ? pub.produit.id.toString() : pub.produit.toString()) : '',
      dishName: pNom,
      title: titleStr,
      description: pub.description || '',
      category: (pub.produit && typeof pub.produit === 'object' && pub.produit.categorie) ? (pub.produit.categorie.nom || 'Spécialités') : 'Spécialités',
      dishTag: 'Vidéo Food',
      viewsCount: pub.nombre_vues || 0,
      likesCount: pub.nombre_likes || 0,
      durationSeconds: pub.max_duree_secondes || 180,
      publishedAt: pub.date_publication ? new Date(pub.date_publication).toLocaleDateString('fr-FR') : 'Récemment',
      isVisiblePublic: true
    };
  }

  prependVideo(video: ProVideoUpload): void {
    const current = [video, ...this.videosSubject.value.filter(v => v.id !== video.id)];
    this.videosSubject.next(current);
  }

  toggleVideoVisibility(videoId: string): void {
    const updated = this.videosSubject.value.map(v => {
      if (v.id === videoId) {
        return { ...v, isVisiblePublic: !v.isVisiblePublic };
      }
      return v;
    });
    this.videosSubject.next(updated);
  }

  deleteVideo(videoId: string): Observable<void> {
    const numId = parseInt(videoId, 10);
    if (!isNaN(numId)) {
      return this.professionalService.deleteFeedPublication(numId).pipe(
        tap(() => {
          const current = this.videosSubject.value.filter(v => v.id !== videoId);
          this.videosSubject.next(current);
        })
      );
    } else {
      const current = this.videosSubject.value.filter(v => v.id !== videoId);
      this.videosSubject.next(current);
      return of(undefined);
    }
  }
}
