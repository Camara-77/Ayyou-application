import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Category, Dish, FeedItem, PaymentMethod, Restaurant, SearchResult, Vendor, UserProfile, NotificationItem, OrderHistoryItem, ProductDetail, OrderTrackingData, OrderValidationData } from '../models/client';

@Injectable({
  providedIn: 'root'
})
export class ClientDataService {

  private categories: Category[] = [
    {
      id: 'all',
      name: 'Tous',
      imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=200&q=80',
      active: true
    },
    {
      id: 'viande',
      name: 'Viande',
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=200&q=80'
    },
    {
      id: 'burgers',
      name: 'Burgers',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80'
    },
    {
      id: 'thiebou',
      name: 'Thiébou',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'
    },
    {
      id: 'brunch',
      name: 'Brunch',
      imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=200&q=80'
    },
    {
      id: 'desserts',
      name: 'Desserts',
      imageUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=200&q=80'
    }
  ];

  private dishes: Dish[] = [
    {
      id: 'd1',
      name: 'Thiéboudienne Penda Mbaye',
      description: 'Riz au poisson rouge traditionnel préparé avec légumes frais, tamarin et piment vert.',
      price: 4500,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      categoryId: 'thiebou',
      categoryName: 'Plats Nationaux',
      restaurantId: 'rest1',
      restaurantName: 'Chez Loutcha',
      likesCount: 1245,
      preparationTime: '25-30 min',
      tags: ['Populaire', 'Sénégalais']
    },
    {
      id: 'd2',
      name: 'Yassa Poulet Gourmet',
      description: 'Poulet mariné grillé au feu de bois avec sauce oignons caramélisés et moutarde à l’ancienne.',
      price: 3500,
      imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80',
      categoryId: 'viande',
      categoryName: 'Plats Nationaux',
      restaurantId: 'rest1',
      restaurantName: 'Chez Loutcha',
      likesCount: 980,
      preparationTime: '20-25 min',
      tags: ['Incontournable']
    },
    {
      id: 'd3',
      name: 'Pastels au Poisson (6 pcs)',
      description: 'Beignets croustillants farcis au thon frais épicé, servis avec sauce tomate maison.',
      price: 2000,
      imageUrl: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80',
      categoryId: 'brunch',
      categoryName: 'Entrées',
      restaurantId: 'rest1',
      restaurantName: 'Chez Loutcha',
      likesCount: 640,
      preparationTime: '15 min'
    },
    {
      id: 'd4',
      name: 'Mafé Viande de Bœuf',
      description: 'Riz blanc servi avec une onctueuse sauce à la pâte d’arachide et morceaux de bœuf tendres.',
      price: 4000,
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
      categoryId: 'viande',
      categoryName: 'Plats Nationaux',
      restaurantId: 'rest1',
      restaurantName: 'Chez Loutcha',
      likesCount: 812,
      preparationTime: '30 min'
    },
    {
      id: 'd5',
      name: 'Burger Dakar XXL',
      description: 'Double steak haché de bœuf, cheddar fondu, sauce spéciale AYYOU et frites maison.',
      price: 5500,
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
      categoryId: 'burgers',
      categoryName: 'Fast-Food',
      restaurantId: 'rest2',
      restaurantName: 'L’Atelier du Choix Gourmand',
      likesCount: 1530,
      preparationTime: '20 min'
    }
  ];

  private restaurant: Restaurant = {
    id: 'rest1',
    name: 'Chez Loutcha',
    logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    tagline: 'Spécialités Sénégalaises & Africaines',
    description: 'Une véritable institution dakaroise proposant les meilleures recettes traditionnelles cuisinées avec authenticité.',
    location: 'Plateau, Dakar',
    rating: 4.8,
    reviewsCount: 342,
    status: 'open',
    closingTime: '23h30',
    phoneNumber: '+221 33 821 00 00',
    videosCount: 14,
    isFavorite: true,
    categories: [
      { id: 'nationaux', name: 'Plats Nationaux', active: true },
      { id: 'entrees', name: 'Entrées' },
      { id: 'boissons', name: 'Boissons & Desserts' }
    ],
    dishes: this.dishes.filter(d => d.restaurantId === 'rest1')
  };

  private restaurantsList: Restaurant[] = [
    this.restaurant,
    {
      id: 'rest2',
      name: 'L’Atelier du Choix Gourmand',
      logoUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=200&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80',
      tagline: 'Burgers & Grillades',
      location: 'Almadies, Dakar',
      rating: 4.6,
      reviewsCount: 215,
      status: 'open',
      closingTime: '00h00',
      categories: [],
      dishes: []
    },
    {
      id: 'rest3',
      name: 'Chez Tonton Marie',
      logoUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=200&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80',
      tagline: 'Grillades au feu de bois',
      location: 'Mermoz, Dakar',
      rating: 4.7,
      reviewsCount: 189,
      status: 'open',
      closingTime: '22h30',
      categories: [],
      dishes: []
    }
  ];

  private feedItems: FeedItem[] = [
    {
      id: 'f1',
      restaurant: {
        id: 'rest1',
        name: 'Chez Loutcha',
        avatarUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80',
        isVerified: true
      },
      dish: this.dishes[0],
      mediaType: 'image',
      mediaUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      likesCount: 1200,
      isLiked: false,
      sharesCount: 48,
      timeAgo: 'Il y a 10 min'
    },
    {
      id: 'f2',
      restaurant: {
        id: 'rest2',
        name: 'L’Atelier du Choix Gourmand',
        avatarUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=200&q=80',
        isVerified: true
      },
      dish: this.dishes[4],
      mediaType: 'video',
      mediaUrl: 'assets/branding/logoanimeayyou.mp4',
      videoDuration: '2:30',
      maxDurationSeconds: 180,
      likesCount: 1530,
      isLiked: true,
      sharesCount: 92,
      timeAgo: 'Il y a 25 min'
    }
  ];

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

  private vendorsList: Vendor[] = [
    {
      id: 'v1',
      name: 'Chef Alexandre',
      photoUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=200&q=80',
      specialty: 'Pâtisserie Fine',
      location: 'Point E, Dakar',
      rating: 4.9,
      status: 'open',
      dishesCount: 18
    },
    {
      id: 'v2',
      name: 'Pâtisserie & Brunch Dakar',
      photoUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=200&q=80',
      specialty: 'Viennoiseries, Brunch & Jus Frais',
      location: 'Ngor, Dakar',
      rating: 4.7,
      status: 'open',
      dishesCount: 12
    }
  ];

  getFeed(): Observable<FeedItem[]> {
    return of(this.feedItems);
  }

  getRestaurant(id: string): Observable<Restaurant> {
    return of(this.restaurant);
  }

  getRestaurants(): Observable<Restaurant[]> {
    return of(this.restaurantsList);
  }

  getVendors(): Observable<Vendor[]> {
    return of(this.vendorsList);
  }

  getCategories(): Observable<Category[]> {
    return of(this.categories);
  }

  private recommendations: Dish[] = [
    {
      id: 'rec1',
      name: 'Jus de Bissap',
      description: 'Boisson rafraîchissante à la fleur d’hibiscus et menthe',
      price: 1000,
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80',
      restaurantId: 'rest1',
      restaurantName: 'Chez Loutcha'
    },
    {
      id: 'rec2',
      name: 'Jus de Bouye',
      description: 'Jus naturel au fruit du baobab et lait concentré',
      price: 1200,
      imageUrl: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=400&q=80',
      restaurantId: 'rest1',
      restaurantName: 'Chez Loutcha'
    },
    {
      id: 'rec3',
      name: 'Salade Méchouia',
      description: 'Poivrons et tomates grillés assaisonnés à l’huile d’olive',
      price: 1500,
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80',
      restaurantId: 'rest1',
      restaurantName: 'Chez Loutcha'
    }
  ];

  getRecommendations(): Observable<Dish[]> {
    return of(this.recommendations);
  }

  getPaymentMethods(): Observable<PaymentMethod[]> {
    return of(this.paymentMethods);
  }

  getDeliveryAddresses(query: string): Observable<string[]> {
    const addresses = [
      'Appartement L02, Résidence les Palmiers, Dakar',
      'Avenue Léopold Sédar Senghor, Plateau, Dakar',
      'Route des Almadies, Zone 4, Dakar',
      'Avenue Cheikh Anta Diop, Fann, Dakar',
      'Rue 6 x 11, Médina, Dakar',
      'Cité Keur Gorgui, Sacré-Cœur, Dakar'
    ];
    if (!query || !query.trim()) return of(addresses);
    return of(addresses.filter(a => a.toLowerCase().includes(query.toLowerCase())));
  }

  getSearchResults(query: string): Observable<SearchResult> {
    const q = (query || '').toLowerCase().trim();
    if (!q) {
      return of({
        restaurants: this.restaurantsList,
        dishes: this.dishes,
        vendors: this.vendorsList,
        categories: this.categories,
        recentSearches: ['Burger gourmet', 'Thiéboudienne', 'Pâtisserie & Brunch']
      });
    }

    const filteredRestaurants = this.restaurantsList.filter(r =>
      r.name.toLowerCase().includes(q) ||
      (r.tagline && r.tagline.toLowerCase().includes(q)) ||
      (r.location && r.location.toLowerCase().includes(q))
    );

    const filteredDishes = this.dishes.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      d.restaurantName.toLowerCase().includes(q) ||
      (d.tags && d.tags.some(t => t.toLowerCase().includes(q))) ||
      (d.categoryName && d.categoryName.toLowerCase().includes(q))
    );

    const filteredVendors = this.vendorsList.filter(v =>
      v.name.toLowerCase().includes(q) ||
      v.specialty.toLowerCase().includes(q) ||
      v.location.toLowerCase().includes(q)
    );

    return of({
      restaurants: filteredRestaurants,
      dishes: filteredDishes,
      vendors: filteredVendors,
      categories: this.categories,
      recentSearches: ['Burger gourmet', 'Thiéboudienne', 'Pâtisserie & Brunch']
    });
  }

  private userProfile: UserProfile = {
    name: 'Moussa Diop',
    location: 'Dakar, Sénégal',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    notificationsEnabled: true
  };

  private notificationsList: NotificationItem[] = [
    {
      id: 'n1',
      type: 'order_ready',
      restaurantName: 'Chez Loutcha',
      orderRef: '#AY-9482',
      statusText: 'En cours',
      timeAgo: "À l'instant",
      message: 'Votre commande est prête au comptoir de retrait.',
      pickupLimit: 'À retirer avant 13h15',
      hasQrCode: true
    },
    {
      id: 'n2',
      type: 'message',
      restaurantName: 'La Fourchette Dakar',
      statusText: 'Service Relations Clientèle',
      timeAgo: 'Hier, 20h25',
      message: '« Merci pour votre fidélité Moussa ! Votre commande spéciale a été préparée avec soin. Nous espérons vous revoir très bientôt sur l\'application AYYOU. »',
      deliveryStatus: 'Livré à l\'habitation'
    },
    {
      id: 'n3',
      type: 'click_collect',
      restaurantName: 'Click & Collect #AY-9482',
      statusText: 'Validé',
      timeAgo: '13h15',
      message: 'Votre code de retrait a été validé au comptoir de Chez Loutcha. Facture archivée automatiquement.',
      hasReceipt: true
    }
  ];

  private orderHistoryList: OrderHistoryItem[] = [
    {
      id: 'oh1',
      restaurantName: 'Chez Loutcha',
      restaurantIconType: 'food',
      dateText: '12 Nov, 13:45',
      status: 'Livrée',
      items: [
        { name: 'Poulet Yassa', quantity: 1, price: 5000 },
        { name: 'Jus de Bissap', quantity: 2, price: 2000 },
        { name: 'Thiéboudienne', quantity: 1, price: 7000 }
      ],
      deliveryFee: 1500,
      totalPrice: 15500
    },
    {
      id: 'oh2',
      restaurantName: 'La Fourchette',
      restaurantIconType: 'store',
      dateText: '08 Nov, 20:15',
      status: 'En cours',
      items: [
        { name: 'Burger Classic', quantity: 2, price: 14000 },
        { name: 'Frites Maison', quantity: 2, price: 6000 },
        { name: 'Milkshake Vanille', quantity: 2, price: 8000 }
      ],
      deliveryFee: 4000,
      totalPrice: 32000,
      paymentMethod: 'Visa **** 4242'
    }
  ];

  getUserProfile(): Observable<UserProfile> {
    return of(this.userProfile);
  }

  getNotifications(): Observable<NotificationItem[]> {
    return of(this.notificationsList);
  }

  getOrderHistory(): Observable<OrderHistoryItem[]> {
    return of(this.orderHistoryList);
  }

  getFavorites(): Observable<FeedItem[]> {
    const favoriteItems: FeedItem[] = [
      {
        id: 'fav1',
        restaurant: {
          id: 'rest1',
          name: 'Chez Loutcha',
          avatarUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80',
          isVerified: true
        },
        dish: {
          id: 'd1',
          name: 'Thiéboudienne Penda Mbaye',
          description: 'Riz au poisson rouge traditionnel préparé avec légumes frais, tamarin et piment vert.',
          price: 4500,
          imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
          restaurantId: 'rest1',
          restaurantName: 'Chez Loutcha'
        },
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        likesCount: 1200,
        isLiked: true,
        sharesCount: 48,
        timeAgo: 'Favori'
      },
      {
        id: 'fav2',
        restaurant: {
          id: 'rest1',
          name: 'Chez Loutcha',
          avatarUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80',
          isVerified: true
        },
        dish: {
          id: 'd2_fav',
          name: 'Thiéboudienne Penda Mbaye',
          description: 'Riz au poisson rouge traditionnel préparé avec légumes frais.',
          price: 4500,
          imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
          restaurantId: 'rest1',
          restaurantName: 'Chez Loutcha'
        },
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        likesCount: 1200,
        isLiked: true,
        sharesCount: 48,
        timeAgo: 'Favori'
      }
    ];
    return of(favoriteItems);
  }

  getProductDetail(id: string): Observable<ProductDetail> {
    const mockProductDetail: ProductDetail = {
      id: id || 'd1',
      name: 'Thiéboudienne Rouge Royale',
      price: 4500,
      description: 'Véritable Ceebu Jën rouge authentique mijoté avec ses épices. Servi avec une darne de mérou blanc frais (Tiof), carottes fondantes, chou vert, manioc tendre et piment doux sur lit de riz cassé deux fois.',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
      ],
      stockInfo: 'En stock',
      preparationTime: 'Prépa ~25 min',
      restaurant: {
        id: 'rest1',
        name: 'Chez Loutcha',
        subtitle: 'Cuisine dakaroise authentique',
        initials: 'CL'
      },
      variants: [
        {
          id: 'v1',
          title: 'Classique (1 personne)',
          subtitle: '1 pers. avec darne de Tiof 300g, légumes',
          priceOffset: 0,
          isRequired: true
        },
        {
          id: 'v2',
          title: 'Gourmand Tiof XL',
          subtitle: 'Pimentée, double darne de Tiof, légumes chamarrés',
          priceOffset: 1500
        },
        {
          id: 'v3',
          title: 'Plat Familial Teranga (3-4 pers.)',
          subtitle: 'Grand plat traditionnel en inox pour partage',
          priceOffset: 6000
        }
      ],
      sauces: [
        {
          id: 's1',
          title: 'Sauce Beugueul',
          subtitle: 'Feuilles d\'oseille acidulées',
          priceOffset: 0,
          isIncluded: true
        },
        {
          id: 's2',
          title: 'Sauce Nététou',
          subtitle: 'Graines de caroube fermentées',
          priceOffset: 0
        }
      ],
      supplements: [
        {
          id: 'sup1',
          title: 'Croûte de riz chaud (Xoogn)',
          priceOffset: 500
        },
        {
          id: 'sup2',
          title: 'Portion de légumes confits en plus',
          priceOffset: 700
        },
        {
          id: 'sup3',
          title: 'Jus de Bissap Maison Frais (33cl)',
          priceOffset: 1000
        }
      ]
    };
    return of(mockProductDetail);
  }

  getOrderTracking(id: string): Observable<OrderTrackingData> {
    const mockTracking: OrderTrackingData = {
      id: id || 'ot1',
      orderRef: 'AY-9482',
      restaurant: {
        name: 'Chez Loutcha',
        status: 'Ouvert',
        subtitle: 'Cuisine sénégalaise & Africaine',
        address: '101 Rue de Sandaga, Dakar'
      },
      etaTime: '13h45',
      etaRemainingMinutes: 12,
      steps: [
        { label: 'Validée', completed: true, active: false },
        { label: 'En cuisine', completed: true, active: false },
        { label: 'En route', completed: false, active: true },
        { label: 'Livrée', completed: false, active: false }
      ],
      metrics: {
        remainingTime: '12 min',
        distance: '1.8 km',
        condition: 'Fluide'
      },
      driver: {
        name: 'Amadou Sali',
        badge: 'Livreur Pro',
        vehicle: 'Scooter Yamaha NMAX',
        rating: 4.9,
        phone: '+221 77 000 00 00'
      },
      items: [
        { name: 'Thiéboudienne Penda Mbaye', quantity: 1, price: 3500 },
        { name: 'Alloco & Sauce Piment', quantity: 1, price: 1200 },
        { name: 'Jus de Bissap Maison (50cl)', quantity: 1, price: 800 }
      ],
      totalPrice: 5500,
      deliveryAddress: {
        recipientName: 'Alia Ndiaye',
        addressText: 'Villa 14, Allées Seydou Nourou Tall, Point E',
        instructions: 'Instructions : Sonner au portail noir, 1er étage.',
        tag: 'Sans contact'
      },
      securityCode: '9482'
    };
    return of(mockTracking);
  }

  getOrderValidation(id: string): Observable<OrderValidationData> {
    const mockValidation: OrderValidationData = {
      id: id || 'ov1',
      orderRef: 'AY-9482',
      priorityText: 'Prioritaire',
      clientCode: 'AY • 9482',
      readySinceTime: '12h45',
      pickupLimitTime: '13h15',
      timerRemainingMinutes: 30,
      preparationStepCurrent: 3,
      preparationStepTotal: 4,
      steps: [
        { label: 'Validée', completed: true, active: false },
        { label: 'En cuisine', completed: true, active: false },
        { label: 'Au comptoir', completed: false, active: true },
        { label: 'Récupérée', completed: false, active: false }
      ],
      restaurant: {
        name: 'Chez Loutcha',
        status: 'Ouvert',
        address: '101 Rue Carnot, Dakar Plateau',
        phone: '+221 33 821 00 00'
      },
      items: [
        { name: 'Thiéboudienne Rouge Royale', quantity: 1, price: 4500 },
        { name: 'Yassa au Poulet Braisé', quantity: 1, price: 4500 },
        { name: 'Bissap Royal Menthe Fraîche', quantity: 2, price: 1500 }
      ],
      itemCount: 3,
      bagNumber: '#44',
      paymentMethod: 'Wave',
      totalPrice: 10500
    };
    return of(mockValidation);
  }
}
