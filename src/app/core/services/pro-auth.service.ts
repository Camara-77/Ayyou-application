import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ProfessionalProfile, ProfessionalType } from '../models/pro';

@Injectable({
  providedIn: 'root'
})
export class ProAuthService {
  private initialProfile: ProfessionalProfile = {
    id: 'pro1',
    type: 'RESTAURANT',
    name: 'Chez Loutcha',
    avatarUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    tagline: 'Spécialités Sénégalaises & Africaines',
    description: 'Une véritable institution dakaroise proposant les meilleures recettes traditionnelles cuisinées avec authenticité.',
    location: 'Plateau, Dakar',
    address: 'Route de Ngor, Quartier Almadies, Dakar',
    phone: '+221 33 820 45 67',
    status: 'open',
    isOpen: true,
    closingTime: '23h30',
    cuisineTypes: ['Thiéboudienne', 'Yassa Poulet', 'Mafé', 'Thiala'],
    openingHours: 'Lun - Dim: 11:30 - 23:30',
    serviceModes: {
      livraison: true,
      clickAndCollect: true,
      surPlace: true
    }
  };

  private profileSubject = new BehaviorSubject<ProfessionalProfile>(this.initialProfile);
  profile$: Observable<ProfessionalProfile> = this.profileSubject.asObservable();

  get currentProfile(): ProfessionalProfile {
    return this.profileSubject.value;
  }

  getProfile(): ProfessionalProfile {
    return this.profileSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.profileSubject.value;
  }

  login(identifier: string, pass: string): Observable<boolean> {
    return of(true);
  }

  logout(): void {
    // mock logout
  }

  toggleStatus(): void {
    const current = this.profileSubject.value;
    const isNowOpen = !current.isOpen;
    this.profileSubject.next({
      ...current,
      isOpen: isNowOpen,
      status: isNowOpen ? 'open' : 'closed'
    });
  }

  toggleServiceMode(mode: 'livraison' | 'clickAndCollect' | 'surPlace'): void {
    const current = this.profileSubject.value;
    const modes = current.serviceModes || { livraison: true, clickAndCollect: true, surPlace: true };
    this.profileSubject.next({
      ...current,
      serviceModes: {
        ...modes,
        [mode]: !modes[mode]
      }
    });
  }

  updateProfile(profile: Partial<ProfessionalProfile>): void {
    this.profileSubject.next({
      ...this.profileSubject.value,
      ...profile
    });
  }

  setProfessionalType(type: ProfessionalType): void {
    this.profileSubject.next({
      ...this.profileSubject.value,
      type,
      name: (type === 'restaurant' || type === 'RESTAURANT') ? 'Chez Loutcha' : 'Artisan Dakar Gourmet'
    });
  }
}
