import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClientDataService } from './client-data.service';
import { environment } from '../../../environments/environment';

describe('ClientDataService - Catalog API Integration', () => {
  let service: ClientDataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClientDataService]
    });
    service = TestBed.inject(ClientDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch categories from /api/catalog/categories/', () => {
    const mockCategoriesResponse = [
      { id: 'cat-1', nom: 'Plats Nationaux', slug: 'plats-nationaux', icone: 'utensils', image_url: 'http://img.jpg', ordre_affichage: 1, est_active: true }
    ];

    service.getCategories().subscribe(categories => {
      expect(categories.length).toBe(1);
      expect(categories[0].name).toBe('Plats Nationaux');
      expect(categories[0].id).toBe('cat-1');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/catalog/categories/`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCategoriesResponse);
  });

  it('should fetch restaurants from /api/catalog/establishments/?type_etablissement=RESTAURANT', () => {
    const mockEstablishmentsResponse = {
      count: 1,
      results: [
        {
          id: 'rest-1',
          nom_etablissement: 'Chez Loutcha',
          type_etablissement: 'RESTAURANT',
          statut: 'OUVERT',
          description: 'Cuisine dakaroise',
          adresse: 'Plateau, Dakar',
          specialite_nom: 'Sénégalais',
          logo_url: 'http://logo.jpg',
          couverture_url: 'http://cover.jpg'
        }
      ]
    };

    service.getRestaurants().subscribe(restaurants => {
      expect(restaurants.length).toBe(1);
      expect(restaurants[0].name).toBe('Chez Loutcha');
      expect(restaurants[0].status).toBe('open');
    });

    const req = httpMock.expectOne(request =>
      request.url === `${environment.apiUrl}/api/catalog/establishments/` &&
      request.params.get('type_etablissement') === 'RESTAURANT'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockEstablishmentsResponse);
  });

  it('should fetch dishes from /api/catalog/products/', () => {
    const mockProductsResponse = {
      count: 1,
      results: [
        {
          id: 'prod-1',
          nom: 'Thiéboudienne',
          description: 'Riz au poisson',
          prix: '4500.00',
          image_url: 'http://dish.jpg',
          etablissement: 'rest-1',
          etablissement_nom: 'Chez Loutcha',
          categorie: 'cat-1',
          categorie_nom: 'Plats Nationaux',
          est_disponible: true,
          nombre_likes: 120
        }
      ]
    };

    service.getDishes().subscribe(dishes => {
      expect(dishes.length).toBe(1);
      expect(dishes[0].name).toBe('Thiéboudienne');
      expect(dishes[0].price).toBe(4500);
      expect(dishes[0].likesCount).toBe(120);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/catalog/products/`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProductsResponse);
  });

  it('should fetch product detail from /api/catalog/products/{id}/', () => {
    const mockDetailResponse = {
      id: 'prod-1',
      nom: 'Thiéboudienne Rouge Royale',
      description: 'Délicieux Ceebu Jën',
      prix: '4500.00',
      image_url: 'http://dish.jpg',
      etablissement: { id: 'rest-1', nom_etablissement: 'Chez Loutcha', logo_url: 'http://logo.jpg' },
      categorie: { id: 'cat-1', nom: 'Plats Nationaux' },
      est_disponible: true,
      nombre_likes: 150,
      variantes: [{ id: 'v-1', nom: 'Tiof XL', description: 'Portion généreuse', prix_supplementaire: '1000.00', est_obligatoire: true }],
      sauces: [{ id: 's-1', nom: 'Sauce Beugueul', description: 'Oseille', prix_supplementaire: '0.00', est_inclus: true }],
      supplements: [{ id: 'sup-1', nom: 'Xoogn', prix_supplementaire: '500.00' }]
    };

    service.getProductDetail('prod-1').subscribe(detail => {
      expect(detail.name).toBe('Thiéboudienne Rouge Royale');
      expect(detail.variants.length).toBe(1);
      expect(detail.variants[0].priceOffset).toBe(1000);
      expect(detail.sauces.length).toBe(1);
      expect(detail.supplements.length).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/catalog/products/prod-1/`);
    expect(req.request.method).toBe('GET');
    req.flush(mockDetailResponse);
  });

  it('should fetch feed items from /api/catalog/feed/', () => {
    const mockFeedResponse = {
      count: 1,
      results: [
        {
          id: 'feed-1',
          etablissement: { id: 'rest-1', nom_etablissement: 'Chez Loutcha', logo_url: 'http://logo.jpg' },
          produit: { id: 'prod-1', nom: 'Yassa Poulet', prix: '3500.00', image_url: 'http://dish.jpg', est_disponible: true, nombre_likes: 50 },
          type_media: 'IMAGE',
          media_url: 'http://media.jpg',
          description: 'Spécialité du jour',
          is_liked: true
        }
      ]
    };

    service.getFeed().subscribe(feed => {
      expect(feed.length).toBe(1);
      expect(feed[0].isLiked).toBeTrue();
      expect(feed[0].dish.name).toBe('Yassa Poulet');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/catalog/feed/`);
    expect(req.request.method).toBe('GET');
    req.flush(mockFeedResponse);
  });

  it('should send POST request for likeProduct', () => {
    service.likeProduct('prod-1').subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/catalog/likes/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ produit: 'prod-1' });
    req.flush({ id: 'like-1', produit: 'prod-1' });
  });

  it('should send DELETE request for unlikeProduct', () => {
    service.unlikeProduct('prod-1').subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/catalog/likes/`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.body).toEqual({ produit: 'prod-1' });
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
