import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { DeliveryService } from './delivery.service';
import { Livraison } from '../models/delivery';

describe('DeliveryService', () => {
  let service: DeliveryService;
  let httpMock: HttpTestingController;

  const mockLivraison: Livraison = {
    id: 1,
    commande: 10,
    commande_reference: 'AYY-20260916-A1B2C3',
    statut: 'EN_ATTENTE',
    statut_display: 'En attente',
    frais_livraison: '1000.00',
    total_commande: '4500.00',
    nom_destinataire: 'Moussa Diallo',
    telephone_destinataire: '+221771112233',
    adresse_livraison: 'Mermoz, Dakar',
    token_qr: 'AYYOU-DELIVERY-abc123def456',
    code_validation: '482731',
    est_validee: false,
    created_at: '2026-09-16T20:00:00Z',
    updated_at: '2026-09-16T20:00:00Z'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DeliveryService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(DeliveryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch list of available deliveries', () => {
    service.getAvailableDeliveries().subscribe(list => {
      expect(list.length).toBe(1);
      expect(list[0].token_qr).toBe('AYYOU-DELIVERY-abc123def456');
    });

    const req = httpMock.expectOne(request => request.url.endsWith('/api/deliveries/available/'));
    expect(req.request.method).toBe('GET');
    req.flush([mockLivraison]);
  });

  it('should accept a delivery', () => {
    const acceptedLivraison = { ...mockLivraison, statut: 'ACCEPTEE' as const, livreur: 2 };

    service.acceptDelivery(1).subscribe(res => {
      expect(res.statut).toBe('ACCEPTEE');
      expect(res.livreur).toBe(2);
    });

    const req = httpMock.expectOne(request => request.url.endsWith('/api/deliveries/1/accept/'));
    expect(req.request.method).toBe('POST');
    req.flush(acceptedLivraison);
  });

  it('should declare pickup of a delivery', () => {
    const pickupLivraison = { ...mockLivraison, statut: 'EN_LIVRAISON' as const };

    service.pickupDelivery(1).subscribe(res => {
      expect(res.statut).toBe('EN_LIVRAISON');
    });

    const req = httpMock.expectOne(request => request.url.endsWith('/api/deliveries/1/pickup/'));
    expect(req.request.method).toBe('POST');
    req.flush(pickupLivraison);
  });

  it('should validate delivery by QR Token', () => {
    const updatedLivraison = { ...mockLivraison, est_validee: true, statut: 'LIVREE' as const };

    service.validateByQr({ token_qr: 'AYYOU-DELIVERY-abc123def456' }).subscribe(res => {
      expect(res.est_validee).toBeTrue();
      expect(res.statut).toBe('LIVREE');
    });

    const req = httpMock.expectOne(request => request.url.endsWith('/api/deliveries/validate-qr/'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body.token_qr).toBe('AYYOU-DELIVERY-abc123def456');
    req.flush(updatedLivraison);
  });

  it('should validate delivery by 6-digit code', () => {
    const updatedLivraison = { ...mockLivraison, est_validee: true, statut: 'LIVREE' as const };

    service.validateByCode({ commande: 10, code_validation: '482731' }).subscribe(res => {
      expect(res.est_validee).toBeTrue();
    });

    const req = httpMock.expectOne(request => request.url.endsWith('/api/deliveries/validate-code/'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body.code_validation).toBe('482731');
    req.flush(updatedLivraison);
  });
});
