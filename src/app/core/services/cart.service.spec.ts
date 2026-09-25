import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CartService } from './cart.service';
import { environment } from '../../../environments/environment';
import { Dish } from '../models/client';
import { BackendCart } from '../models/orders';

describe('CartService', () => {
  let service: CartService;
  let httpMock: HttpTestingController;

  const mockDish: Dish = {
    id: '1',
    name: 'Thiéboudienne',
    description: 'Riz au poisson',
    price: 4500,
    imageUrl: 'https://example.com/thiebou.jpg',
    restaurantId: 'rest1',
    restaurantName: 'Chez Loutcha'
  };

  const mockBackendCart: BackendCart = {
    id: 10,
    actif: true,
    total_panier: '4500.00',
    nombre_articles: 1,
    items: [
      {
        id: 101,
        produit: {
          id: 1,
          nom: 'Thiéboudienne',
          prix_base: '4500.00',
          image_url: 'https://example.com/thiebou.jpg',
          etablissement_id: 'rest1',
          etablissement_nom: 'Chez Loutcha'
        },
        quantite: 1,
        prix_unitaire: '4500.00',
        prix_total_unitaire: '4500.00',
        total_ligne: '4500.00'
      }
    ]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CartService]
    });
    service = TestBed.inject(CartService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('1. Récupération du panier (loadCart)', () => {
    // Flush initial constructor request
    const initReq = httpMock.expectOne(`${environment.apiUrl}/api/orders/cart/`);
    initReq.flush(mockBackendCart);

    service.loadCart().subscribe(cart => {
      expect(cart).toBeTruthy();
      expect(cart?.items.length).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/orders/cart/`);
    expect(req.request.method).toBe('GET');
    req.flush(mockBackendCart);

    expect(service.items.length).toBe(1);
    expect(service.getSubtotal()).toBe(4500);
  });

  it('2. Ajout d\'un article (addToCart)', () => {
    const initReq = httpMock.expectOne(`${environment.apiUrl}/api/orders/cart/`);
    initReq.flush(mockBackendCart);

    service.addToCart(mockDish, 2, 'v1', ['opt1']).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/orders/cart/items/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      produit: '1',
      quantite: 2,
      variante: 'v1',
      options: ['opt1']
    });
    req.flush({ id: 102, quantite: 2 });

    const loadReq = httpMock.expectOne(`${environment.apiUrl}/api/orders/cart/`);
    loadReq.flush(mockBackendCart);
  });

  it('3. Modification de quantité (updateQuantity)', () => {
    const initReq = httpMock.expectOne(`${environment.apiUrl}/api/orders/cart/`);
    initReq.flush(mockBackendCart);

    service.updateQuantity(101, 3).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/orders/cart/items/101/`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ quantite: 3 });
    req.flush({ id: 101, quantite: 3 });

    const loadReq = httpMock.expectOne(`${environment.apiUrl}/api/orders/cart/`);
    loadReq.flush(mockBackendCart);
  });

  it('4. Suppression d\'un article (removeFromCart)', () => {
    const initReq = httpMock.expectOne(`${environment.apiUrl}/api/orders/cart/`);
    initReq.flush(mockBackendCart);

    service.removeFromCart(101).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/orders/cart/items/101/`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    const loadReq = httpMock.expectOne(`${environment.apiUrl}/api/orders/cart/`);
    loadReq.flush({ ...mockBackendCart, items: [], total_panier: '0.00' });
  });

  it('5. Vidage du panier (clearCart)', () => {
    const initReq = httpMock.expectOne(`${environment.apiUrl}/api/orders/cart/`);
    initReq.flush(mockBackendCart);

    service.clearCart().subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/orders/cart/`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(service.items.length).toBe(0);
    expect(service.getSubtotal()).toBe(0);
  });
});
