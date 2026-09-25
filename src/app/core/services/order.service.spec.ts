import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OrderService } from './order.service';
import { environment } from '../../../environments/environment';
import { CheckoutPayload, CommandeOrder } from '../models/orders';

describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;

  const mockCommande: CommandeOrder = {
    id: 1,
    numero_commande: 'AY-20260916-0001',
    statut: 'EN_ATTENTE_PAIEMENT',
    sous_total: '4500.00',
    frais_livraison: '1000.00',
    total: '5500.00',
    adresse_livraison: 'Point E, Dakar',
    nom_destinataire: 'Moussa Diop',
    telephone_destinataire: '+221771234567',
    sous_commandes: [],
    date_creation: '2026-09-16T18:00:00Z'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrderService]
    });
    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('11. Passage de commande (checkout)', () => {
    const payload: CheckoutPayload = {
      adresse_livraison: 'Point E, Dakar',
      destinataire: { nom: 'Moussa Diop', telephone: '+221771234567' }
    };

    service.checkout(payload).subscribe(cmd => {
      expect(cmd.numero_commande).toBe('AY-20260916-0001');
      expect(cmd.total).toBe('5500.00');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/orders/checkout/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockCommande);
  });

  it('12. Récupération des commandes (getOrders)', () => {
    service.getOrders().subscribe(orders => {
      expect(orders.length).toBe(1);
      expect(orders[0].id).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/orders/`);
    expect(req.request.method).toBe('GET');
    req.flush([mockCommande]);
  });

  it('13. Récupération du détail d\'une commande (getOrderById)', () => {
    service.getOrderById(1).subscribe(cmd => {
      expect(cmd.id).toBe(1);
      expect(cmd.numero_commande).toBe('AY-20260916-0001');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/orders/1/`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCommande);
  });
});
