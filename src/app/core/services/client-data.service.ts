import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Category, Dish, FeedItem, PaymentMethod, Restaurant, SearchResult, Vendor, UserProfile, NotificationItem, OrderHistoryItem, ProductDetail, OrderTrackingData, OrderValidationData } from '../models/client';

export interface BackendUserProfile {
  id: number;
  email: string;
  numero_telephone: string;
  prenom: string;
  nom: string;
  nom_complet: string;
  est_actif: boolean;
  est_verifie: boolean;
  profil_client?: {
    id: number;
    photo_avatar?: string;
    adresse_principale?: string;
    latitude?: number;
    longitude?: number;
    date_naissance?: string;
    notifications_activees?: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ClientDataService {
  constructor(private http: HttpClient) {}

  private paymentMethods: PaymentMethod[] = [
    {
      id: 'wave',
      name: 'Wave',
      logoUrl: 'assets/branding/wave.png',
      active: true,
      color: '#1DC4EB'
    },
    {
      id: 'orange_money',
      name: 'Orange Money',
      logoUrl: 'assets/branding/orange_money.png',
      active: false,
      color: '#FF6600'
    }
  ];

  getFeed(): Observable<FeedItem[]> {
    return this.http.get<any>(`${environment.apiUrl}/api/catalog/feed/`).pipe(
      map(res => {
        const list = Array.isArray(res) ? res : (res?.results || []);
        return list.map((f: any) => this.mapBackendToFeedItem(f));
      }),
      catchError(() => of([]))
    );
  }

  getRestaurant(id: string): Observable<Restaurant> {
    return this.http.get<any>(`${environment.apiUrl}/api/catalog/establishments/${id}/`).pipe(
      switchMap(est => {
        const restaurant = this.mapBackendToRestaurant(est);
        return this.http.get<any>(`${environment.apiUrl}/api/catalog/products/?etablissement=${id}`).pipe(
          map(prodRes => {
            const prods = Array.isArray(prodRes) ? prodRes : (prodRes?.results || []);
            restaurant.dishes = prods.map((p: any) => this.mapBackendToDish(p));
            return restaurant;
          }),
          catchError(() => of(restaurant))
        );
      }),
      catchError(() => of({
        id,
        name: 'Établissement AYYOU',
        logoUrl: '',
        coverUrl: '',
        tagline: '',
        description: '',
        location: '',
        rating: 0,
        reviewsCount: 0,
        status: 'closed' as const,
        closingTime: '',
        categories: [],
        dishes: []
      }))
    );
  }

  getRestaurants(params?: { search?: string; categoryId?: string }): Observable<Restaurant[]> {
    let httpParams = new HttpParams().set('type_etablissement', 'RESTAURANT');
    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params?.categoryId && params.categoryId !== 'all') {
      httpParams = httpParams.set('specialite', params.categoryId);
    }
    return this.http.get<any>(`${environment.apiUrl}/api/catalog/establishments/`, { params: httpParams }).pipe(
      map(res => {
        const list = Array.isArray(res) ? res : (res?.results || []);
        return list.map((item: any) => this.mapBackendToRestaurant(item));
      }),
      catchError(() => of([]))
    );
  }

  getVendors(params?: { search?: string }): Observable<Vendor[]> {
    let httpParams = new HttpParams().set('type_etablissement', 'VENDEUR');
    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }
    return this.http.get<any>(`${environment.apiUrl}/api/catalog/establishments/`, { params: httpParams }).pipe(
      map(res => {
        const list = Array.isArray(res) ? res : (res?.results || []);
        return list.map((item: any) => this.mapBackendToVendor(item));
      }),
      catchError(() => of([]))
    );
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<any>(`${environment.apiUrl}/api/catalog/categories/`).pipe(
      map(res => {
        const list = Array.isArray(res) ? res : (res?.results || []);
        return list
          .filter((cat: any) => cat.est_active !== false && !cat.nom?.toLowerCase().includes('test'))
          .map((cat: any) => ({
            id: cat.id ? cat.id.toString() : cat.slug,
            name: cat.nom,
            icon: cat.icone,
            imageUrl: cat.image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=200&q=80',
            active: cat.est_active
          }));
      }),
      catchError(() => of([]))
    );
  }

  getDishes(params?: { categoryId?: string; establishmentId?: string; search?: string }): Observable<Dish[]> {
    let httpParams = new HttpParams();
    if (params?.categoryId && params.categoryId !== 'all') {
      httpParams = httpParams.set('categorie', params.categoryId);
    }
    if (params?.establishmentId) {
      httpParams = httpParams.set('etablissement', params.establishmentId);
    }
    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }
    return this.http.get<any>(`${environment.apiUrl}/api/catalog/products/`, { params: httpParams }).pipe(
      map(res => {
        const list = Array.isArray(res) ? res : (res?.results || []);
        return list.map((item: any) => this.mapBackendToDish(item));
      }),
      catchError(() => of([]))
    );
  }

  likeProduct(productId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/catalog/likes/`, { produit: productId });
  }

  unlikeProduct(productId: string): Observable<any> {
    return this.http.request('delete', `${environment.apiUrl}/api/catalog/likes/`, {
      body: { produit: productId }
    });
  }

  likeFeedPublication(publicationId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/catalog/likes/`, { publication_feed: publicationId });
  }

  unlikeFeedPublication(publicationId: string): Observable<any> {
    return this.http.request('delete', `${environment.apiUrl}/api/catalog/likes/`, {
      body: { publication_feed: publicationId }
    });
  }

  private mapBackendToRestaurant(item: any): Restaurant {
    return {
      id: item.id ? item.id.toString() : '',
      name: item.nom || item.nom_etablissement || 'Établissement',
      logoUrl: item.logo_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80',
      coverUrl: item.couverture_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      tagline: item.slogan || item.specialite || item.description || 'Spécialités AYYOU',
      description: item.description || '',
      location: item.adresse || 'Dakar, Sénégal',
      rating: typeof item.note_moyenne === 'string' ? parseFloat(item.note_moyenne) : (item.note_moyenne || 4.8),
      reviewsCount: item.nombre_avis || 0,
      status: (item.statut === 'open' || item.statut === 'OUVERT') ? 'open' : 'closed',
      closingTime: item.heure_fermeture || '23h30',
      categories: [],
      dishes: []
    };
  }

  private mapBackendToVendor(item: any): Vendor {
    return {
      id: item.id ? item.id.toString() : '',
      name: item.nom || item.nom_etablissement || 'Vendeur AYYOU',
      photoUrl: item.logo_url || item.couverture_url || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=200&q=80',
      specialty: item.specialite || item.slogan || item.description || 'Produits & Plats faits maison',
      location: item.adresse || 'Dakar, Sénégal',
      rating: typeof item.note_moyenne === 'string' ? parseFloat(item.note_moyenne) : (item.note_moyenne || 4.8),
      status: (item.statut === 'open' || item.statut === 'OUVERT') ? 'open' : 'closed',
      dishesCount: item.nombre_produits || 0
    };
  }

  private mapBackendToDish(p: any): Dish {
    const rawPrice = p.prix_base ?? p.prix;
    return {
      id: p.id ? p.id.toString() : '',
      name: p.nom || '',
      description: p.description || '',
      price: typeof rawPrice === 'string' ? parseFloat(rawPrice) : (rawPrice || 0),
      imageUrl: p.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      categoryId: typeof p.categorie === 'object' ? p.categorie?.id?.toString() : (p.categorie ? p.categorie.toString() : ''),
      categoryName: typeof p.categorie === 'object' ? p.categorie?.nom : (p.categorie_nom || ''),
      restaurantId: typeof p.etablissement === 'object' ? p.etablissement?.id?.toString() : (p.etablissement ? p.etablissement.toString() : ''),
      restaurantName: typeof p.etablissement === 'object' ? (p.etablissement?.nom || p.etablissement?.nom_etablissement) : (p.etablissement_nom || 'AYYOU Établissement'),
      likesCount: p.nombre_likes || 0,
      preparationTime: p.temps_preparation || '20-30 min',
      tags: p.tags || ['Sénégalais']
    };
  }

  private mapBackendToFeedItem(f: any): FeedItem {
    const etabName = f.etablissement?.nom || f.etablissement?.nom_etablissement || 'AYYOU Établissement';
    return {
      id: f.id ? f.id.toString() : '',
      restaurant: {
        id: f.etablissement?.id ? f.etablissement.id.toString() : '',
        name: etabName,
        avatarUrl: f.etablissement?.logo_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80',
        isVerified: f.etablissement?.est_verifie ?? true
      },
      dish: f.produit ? this.mapBackendToDish(f.produit) : {
        id: f.id ? f.id.toString() : '',
        name: f.description || 'Spécialité AYYOU',
        description: f.description || '',
        price: 0,
        imageUrl: f.media_url,
        restaurantId: f.etablissement?.id ? f.etablissement.id.toString() : '',
        restaurantName: etabName
      },
      mediaType: (f.type_media === 'VIDEO' || f.type_media === 'video') ? 'video' : 'image',
      mediaUrl: f.media_url,
      videoDuration: f.duree_video || '2:00',
      maxDurationSeconds: f.max_duree_secondes || 180,
      likesCount: f.nombre_likes || (f.produit?.nombre_likes || 0),
      isLiked: !!f.is_liked,
      sharesCount: f.nombre_partages || 0,
      timeAgo: 'Récemment'
    };
  }

  getRecommendations(): Observable<Dish[]> {
    return this.http.get<any>(`${environment.apiUrl}/api/catalog/products/`).pipe(
      map(res => {
        const list = Array.isArray(res) ? res : (res?.results || []);
        return list.slice(0, 5).map((p: any) => this.mapBackendToDish(p));
      }),
      catchError(() => of([]))
    );
  }

  getPaymentMethods(): Observable<PaymentMethod[]> {
    return of(this.paymentMethods);
  }

  getDeliveryAddresses(query: string): Observable<string[]> {
    return this.http.get<any>(`${environment.apiUrl}/api/users/me/location/`).pipe(
      map(res => {
        const addr = res?.adresse_principale;
        return addr ? [addr] : [];
      }),
      catchError(() => of([]))
    );
  }

  getSearchResults(query: string): Observable<SearchResult> {
    const q = (query || '').trim();
    return forkJoin({
      categories: this.getCategories(),
      restaurants: this.getRestaurants({ search: q }),
      dishes: this.getDishes({ search: q }),
      vendors: this.getVendors({ search: q })
    }).pipe(
      map(res => ({
        restaurants: res.restaurants,
        dishes: res.dishes,
        vendors: res.vendors,
        categories: res.categories,
        recentSearches: []
      })),
      catchError(() => of(this.localSearchFallback()))
    );
  }

  private localSearchFallback(): SearchResult {
    return {
      restaurants: [],
      dishes: [],
      vendors: [],
      categories: [],
      recentSearches: []
    };
  }

  getUserProfile(): Observable<UserProfile> {
    return this.http.get<BackendUserProfile>(`${environment.apiUrl}/api/users/me/`).pipe(
      map(res => ({
        name: res.nom_complet || `${res.prenom} ${res.nom}`.trim() || 'Client AYYOU',
        location: res.profil_client?.adresse_principale || 'Dakar, Sénégal',
        avatarUrl: res.profil_client?.photo_avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        notificationsEnabled: res.profil_client?.notifications_activees ?? true
      })),
      catchError(() => of({
        name: 'Client AYYOU',
        location: 'Dakar, Sénégal',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        notificationsEnabled: true
      }))
    );
  }

  getRawUserProfile(): Observable<BackendUserProfile> {
    return this.http.get<BackendUserProfile>(`${environment.apiUrl}/api/users/me/`);
  }

  updateUserProfile(data: any): Observable<BackendUserProfile> {
    return this.http.patch<BackendUserProfile>(`${environment.apiUrl}/api/users/me/`, data);
  }

  updateLocation(latitude: number, longitude: number, adresse_principale?: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/users/me/location/`, {
      latitude,
      longitude,
      adresse_principale
    });
  }

  getNotifications(): Observable<NotificationItem[]> {
    return this.http.get<any>(`${environment.apiUrl}/api/notifications/`).pipe(
      map(res => {
        const list = Array.isArray(res) ? res : (res?.results || []);
        return list.map((n: any) => ({
          id: String(n.id),
          type: n.type_notification || 'order_ready',
          restaurantName: n.titre || 'AYYOU',
          orderRef: n.reference_id ? `#AY-${n.reference_id}` : '',
          statusText: n.statut_display || 'Notification',
          timeAgo: n.created_at ? new Date(n.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '',
          message: n.message || '',
          pickupLimit: '',
          hasQrCode: false
        }));
      }),
      catchError(() => of([]))
    );
  }

  getOrderHistory(): Observable<OrderHistoryItem[]> {
    return this.http.get<any>(`${environment.apiUrl}/api/orders/`).pipe(
      map(res => {
        const list = Array.isArray(res) ? res : (res?.results || []);
        return list.map((cmd: any) => {
          const firstSub = cmd.sous_commandes?.[0];
          const dateObj = cmd.date_creation ? new Date(cmd.date_creation) : new Date();
          const items: Array<{ name: string; quantity: number; price: number }> = [];
          (cmd.sous_commandes || []).forEach((sub: any) => {
            (sub.lignes || []).forEach((l: any) => {
              items.push({
                name: l.nom_produit_snapshot,
                quantity: l.quantite,
                price: parseFloat(l.prix_unitaire || '0')
              });
            });
          });

          return {
            id: String(cmd.id),
            restaurantName: firstSub ? firstSub.etablissement_nom : 'Établissement AYYOU',
            restaurantIconType: 'food',
            dateText: dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
            status: cmd.statut === 'LIVREE' ? 'Livrée' : (cmd.statut === 'ANNULEE' ? 'Annulée' : 'En cours'),
            items: items.length > 0 ? items : [{ name: 'Commande AYYOU', quantity: 1, price: parseFloat(cmd.total || '0') }],
            deliveryFee: parseFloat(cmd.frais_livraison || '1000'),
            totalPrice: parseFloat(cmd.total || '0'),
            paymentMethod: cmd.methode_paiement || 'Wave'
          };
        });
      }),
      catchError(() => of([]))
    );
  }

  getFavorites(): Observable<FeedItem[]> {
    return this.http.get<any>(`${environment.apiUrl}/api/catalog/likes/`).pipe(
      map(res => {
        const list = Array.isArray(res) ? res : (res?.results || []);
        return list.map((item: any) => this.mapBackendToFeedItem(item.publication_feed || item));
      }),
      catchError(() => of([]))
    );
  }

  getProductDetail(id: string): Observable<ProductDetail> {
    return this.http.get<any>(`${environment.apiUrl}/api/catalog/products/${id}/`).pipe(
      map(p => {
        const rawPrice = p.prix_base ?? p.prix;
        const parsedPrice = typeof rawPrice === 'string' ? parseFloat(rawPrice) : (rawPrice || 0);

        return {
          id: p.id ? p.id.toString() : id,
          name: p.nom || '',
          price: parsedPrice,
          description: p.description || '',
          imageUrl: p.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
          images: [p.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'],
          stockInfo: p.est_disponible ? 'En stock' : 'Indisponible',
          preparationTime: p.temps_preparation || 'Prépa ~25 min',
          restaurant: {
            id: p.etablissement?.id ? p.etablissement.id.toString() : (p.etablissement ? p.etablissement.toString() : ''),
            name: p.etablissement?.nom_etablissement || p.etablissement?.nom || 'Établissement',
            subtitle: p.etablissement?.specialite || 'Cuisine dakaroise',
            avatarUrl: p.etablissement?.logo_url,
            initials: (p.etablissement?.nom_etablissement || p.etablissement?.nom || 'AY').substring(0, 2).toUpperCase()
          },
          variants: (p.variantes || []).map((v: any) => {
            const rawOffset = v.surcout_prix ?? v.prix_supplementaire;
            return {
              id: v.id ? v.id.toString() : '',
              title: v.titre || v.nom || 'Option',
              subtitle: v.sous_titre || v.description || '',
              priceOffset: typeof rawOffset === 'string' ? parseFloat(rawOffset) : (rawOffset || 0),
              isRequired: v.est_requis ?? v.est_obligatoire ?? false
            };
          }),
          sauces: (p.sauces || []).map((s: any) => {
            const rawOffset = s.surcout_prix ?? s.prix_supplementaire;
            return {
              id: s.id ? s.id.toString() : '',
              title: s.titre || s.nom || 'Sauce',
              subtitle: s.sous_titre || s.description || '',
              priceOffset: typeof rawOffset === 'string' ? parseFloat(rawOffset) : (rawOffset || 0),
              isIncluded: s.est_inclus ?? false
            };
          }),
          supplements: (p.supplements || []).map((sp: any) => {
            const rawOffset = sp.surcout_prix ?? sp.prix_supplementaire;
            return {
              id: sp.id ? sp.id.toString() : '',
              title: sp.titre || sp.nom || 'Supplément',
              priceOffset: typeof rawOffset === 'string' ? parseFloat(rawOffset) : (rawOffset || 0)
            };
          })
        };
      })
    );
  }

  getOrderTracking(id: string): Observable<OrderTrackingData> {
    return this.http.get<any>(`${environment.apiUrl}/api/orders/${id}/`).pipe(
      map(cmd => ({
        id: String(cmd.id),
        orderRef: cmd.numero_commande || `AY-${cmd.id}`,
        restaurant: {
          name: cmd.sous_commandes?.[0]?.etablissement_nom || 'Établissement AYYOU',
          status: 'Ouvert',
          subtitle: 'Cuisine sénégalaise',
          address: 'Dakar'
        },
        etaTime: 'En cours',
        etaRemainingMinutes: 15,
        steps: [
          { label: 'Validée', completed: true, active: false },
          { label: 'En cuisine', completed: cmd.statut !== 'EN_ATTENTE_PAIEMENT', active: cmd.statut === 'EN_ATTENTE_PAIEMENT' },
          { label: 'En route', completed: cmd.statut === 'LIVREE', active: cmd.statut === 'EN_COURS' },
          { label: 'Livrée', completed: cmd.statut === 'LIVREE', active: cmd.statut === 'LIVREE' }
        ],
        metrics: {
          remainingTime: '15 min',
          distance: '2.0 km',
          condition: 'Fluide'
        },
        driver: {
          name: 'Livreur AYYOU',
          badge: 'Livreur Pro',
          vehicle: 'Scooter',
          rating: 4.8,
          phone: ''
        },
        items: (cmd.sous_commandes || []).flatMap((sub: any) => (sub.lignes || []).map((l: any) => ({
          name: l.nom_produit_snapshot,
          quantity: l.quantite,
          price: parseFloat(l.prix_unitaire || '0')
        }))),
        totalPrice: parseFloat(cmd.total || '0'),
        deliveryAddress: {
          recipientName: cmd.nom_destinataire || 'Client AYYOU',
          addressText: cmd.adresse_livraison || '',
          instructions: cmd.instructions_livraison || '',
          tag: 'Direct'
        },
        securityCode: String(cmd.id).padStart(4, '0')
      })),
      catchError(() => of({
        id,
        orderRef: `AY-${id}`,
        restaurant: { name: 'Établissement AYYOU', status: 'Ouvert', subtitle: '', address: '' },
        etaTime: '--',
        etaRemainingMinutes: 0,
        steps: [],
        metrics: { remainingTime: '0 min', distance: '0 km', condition: 'Normal' },
        driver: { name: 'Livreur AYYOU', badge: 'Pro', vehicle: '', rating: 5, phone: '' },
        items: [],
        totalPrice: 0,
        deliveryAddress: { recipientName: '', addressText: '', instructions: '', tag: '' },
        securityCode: '0000'
      }))
    );
  }

  getOrderValidation(id: string): Observable<OrderValidationData> {
    return this.http.get<any>(`${environment.apiUrl}/api/orders/${id}/`).pipe(
      map(cmd => ({
        id: String(cmd.id),
        orderRef: cmd.numero_commande || `AY-${cmd.id}`,
        priorityText: 'Standard',
        clientCode: `AY • ${cmd.id}`,
        readySinceTime: '--',
        pickupLimitTime: '--',
        timerRemainingMinutes: 20,
        preparationStepCurrent: 2,
        preparationStepTotal: 4,
        steps: [
          { label: 'Validée', completed: true, active: false },
          { label: 'En cuisine', completed: cmd.statut !== 'EN_ATTENTE_PAIEMENT', active: cmd.statut === 'EN_ATTENTE_PAIEMENT' },
          { label: 'Au comptoir', completed: cmd.statut === 'PRETE', active: cmd.statut === 'EN_COURS' },
          { label: 'Récupérée', completed: cmd.statut === 'LIVREE', active: cmd.statut === 'LIVREE' }
        ],
        restaurant: {
          name: cmd.sous_commandes?.[0]?.etablissement_nom || 'Établissement AYYOU',
          status: 'Ouvert',
          address: 'Dakar',
          phone: ''
        },
        items: (cmd.sous_commandes || []).flatMap((sub: any) => (sub.lignes || []).map((l: any) => ({
          name: l.nom_produit_snapshot,
          quantity: l.quantite,
          price: parseFloat(l.prix_unitaire || '0')
        }))),
        itemCount: (cmd.sous_commandes || []).reduce((acc: number, sub: any) => acc + (sub.lignes || []).length, 0),
        bagNumber: `#${cmd.id}`,
        paymentMethod: cmd.methode_paiement || 'Wave',
        totalPrice: parseFloat(cmd.total || '0')
      })),
      catchError(() => of({
        id,
        orderRef: `AY-${id}`,
        priorityText: '',
        clientCode: `AY • ${id}`,
        readySinceTime: '',
        pickupLimitTime: '',
        timerRemainingMinutes: 0,
        preparationStepCurrent: 0,
        preparationStepTotal: 4,
        steps: [],
        restaurant: { name: '', status: '', address: '', phone: '' },
        items: [],
        itemCount: 0,
        bagNumber: `#${id}`,
        paymentMethod: 'Mobile',
        totalPrice: 0
      }))
    );
  }
}
