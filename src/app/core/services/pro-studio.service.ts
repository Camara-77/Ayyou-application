import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ProVideoUpload } from '../models/pro';

@Injectable({
  providedIn: 'root'
})
export class ProStudioService {
  private initialVideos: ProVideoUpload[] = [
    {
      id: 'v1_thieb',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cooking-fresh-vegetables-in-a-pan-41584-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      dishId: 'd1',
      dishName: 'Thiébouddienne Royale',
      title: 'Thiébouddienne Royale',
      description: 'Recette traditionnelle du Thiéboudienne rouge au mérou frais.',
      category: 'Plats Nationaux',
      dishTag: 'Cuisine',
      viewsCount: 4300,
      likesCount: 342,
      durationSeconds: 150,
      publishedAt: 'Il y a 2 jours',
      isVisiblePublic: true
    },
    {
      id: 'v2_poisson',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-chef-cooking-a-dish-in-a-pan-41583-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
      dishId: 'd2',
      dishName: 'Poissons & Braisés',
      title: 'Poissons & Braisés',
      description: 'Poissons frais grillés au feu de bois avec sauces épicées.',
      category: 'Plats Nationaux',
      dishTag: 'Grillades',
      viewsCount: 5800,
      likesCount: 512,
      durationSeconds: 120,
      publishedAt: 'Il y a 3 jours',
      isVisiblePublic: true
    },
    {
      id: 'v3_yassa',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-chef-preparing-a-plate-of-food-41582-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80',
      dishId: 'd3',
      dishName: 'Yassa Poulet Gourmet',
      title: 'Yassa Poulet Gourmet',
      description: 'Poulet mariné au citron vert et oignons caramélisés.',
      category: 'Plats Nationaux',
      dishTag: 'Plat phare',
      viewsCount: 3100,
      likesCount: 290,
      durationSeconds: 180,
      publishedAt: 'Il y a 5 jours',
      isVisiblePublic: true
    },
    {
      id: 'v4_pastels',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cooking-fresh-vegetables-in-a-pan-41584-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
      dishId: 'd4',
      dishName: 'Pastels Croustillants',
      title: 'Pastels Croustillants',
      description: 'Pastels farcis au poisson avec sauce tomate pimentée.',
      category: 'Entrées',
      dishTag: 'Entrée',
      viewsCount: 2900,
      likesCount: 210,
      durationSeconds: 90,
      publishedAt: 'Il y a 1 semaine',
      isVisiblePublic: true
    }
  ];

  private videosSubject = new BehaviorSubject<ProVideoUpload[]>(this.initialVideos);
  videos$: Observable<ProVideoUpload[]> = this.videosSubject.asObservable();

  get videos(): ProVideoUpload[] {
    return this.videosSubject.value;
  }

  getVideos(): ProVideoUpload[] {
    return this.videosSubject.value;
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

  addVideo(video: Partial<ProVideoUpload>): ProVideoUpload {
    const newVid: ProVideoUpload = {
      id: 'v_' + Date.now(),
      videoUrl: video.videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-cooking-fresh-vegetables-in-a-pan-41584-large.mp4',
      thumbnailUrl: video.thumbnailUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      dishId: video.dishId || 'd1',
      dishName: video.dishName || 'Thiéboudienne Penda Mbaye',
      dishTag: video.dishTag || 'Cuisine',
      priceFcfa: video.priceFcfa || 4500,
      category: video.category || 'Plats Nationaux',
      title: video.title || 'Nouvelle vidéo culinaire',
      description: video.description || '#AYYOU #DakarFood',
      durationSeconds: 120,
      publishedAt: 'À l’instant',
      viewsCount: 100,
      likesCount: 12,
      isVisiblePublic: true
    };
    const current = [newVid, ...this.videosSubject.value];
    this.videosSubject.next(current);
    return newVid;
  }

  publishVideo(video: Partial<ProVideoUpload>): Observable<ProVideoUpload> {
    const added = this.addVideo(video);
    return of(added);
  }

  getLatestPublishedVideo(): Observable<ProVideoUpload> {
    return of(this.videosSubject.value[0]);
  }
}
