import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PaymentService } from './payment.service';
import { environment } from '../../../environments/environment';
import { Payment, Invoice, CreatePaymentPayload } from '../models/payment';

describe('PaymentService', () => {
  let service: PaymentService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/api/payments`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PaymentService]
    });
    service = TestBed.inject(PaymentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initiate payment via POST', () => {
    const payload: CreatePaymentPayload = { commande: 10, methode: 'WAVE' };
    const dummyPayment: Payment = {
      id: 1,
      reference: 'PAY-1001',
      commande: 10,
      montant: '5500.00',
      methode: 'WAVE',
      statut: 'INITIE',
      date_creation: '2026-09-16T20:00:00Z'
    };

    service.initiatePayment(payload).subscribe(payment => {
      expect(payment).toEqual(dummyPayment);
    });

    const req = httpMock.expectOne(`${baseUrl}/transactions/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(dummyPayment);
  });

  it('should retrieve payments list and handle DRF pagination wrapper', () => {
    const dummyPayments: Payment[] = [
      {
        id: 1,
        reference: 'PAY-1001',
        commande: 10,
        montant: '5500.00',
        methode: 'WAVE',
        statut: 'PAYE',
        date_creation: '2026-09-16T20:00:00Z'
      }
    ];

    service.getPayments().subscribe(payments => {
      expect(payments.length).toBe(1);
      expect(payments[0].reference).toBe('PAY-1001');
    });

    const req = httpMock.expectOne(`${baseUrl}/transactions/`);
    expect(req.request.method).toBe('GET');
    req.flush({ count: 1, results: dummyPayments });
  });

  it('should retrieve a single payment by ID', () => {
    const dummyPayment: Payment = {
      id: 1,
      reference: 'PAY-1001',
      commande: 10,
      montant: '5500.00',
      methode: 'WAVE',
      statut: 'PAYE',
      date_creation: '2026-09-16T20:00:00Z'
    };

    service.getPaymentById(1).subscribe(payment => {
      expect(payment.reference).toBe('PAY-1001');
    });

    const req = httpMock.expectOne(`${baseUrl}/transactions/1/`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyPayment);
  });

  it('should confirm payment via POST to /confirmer/', () => {
    const dummyPayment: Payment = {
      id: 1,
      reference: 'PAY-1001',
      commande: 10,
      montant: '5500.00',
      methode: 'WAVE',
      statut: 'PAYE',
      date_creation: '2026-09-16T20:00:00Z'
    };

    service.confirmPayment(1, { transaction_externe: 'TX_123' }).subscribe(payment => {
      expect(payment.statut).toBe('PAYE');
    });

    const req = httpMock.expectOne(`${baseUrl}/transactions/1/confirmer/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ transaction_externe: 'TX_123' });
    req.flush(dummyPayment);
  });

  it('should retrieve invoices list', () => {
    const dummyInvoices: Invoice[] = [
      {
        id: 1,
        numero_facture: 'FAC-2026-0001',
        commande: 10,
        nom_client_snapshot: 'Moussa Diop',
        telephone_client_snapshot: '+221770001111',
        adresse_livraison_snapshot: 'Dakar Plateau',
        montant_ht: '4500.00',
        frais_livraison: '1000.00',
        montant_total: '5500.00',
        est_payee: true,
        date_emission: '2026-09-16T20:00:00Z'
      }
    ];

    service.getInvoices().subscribe(invoices => {
      expect(invoices.length).toBe(1);
      expect(invoices[0].numero_facture).toBe('FAC-2026-0001');
    });

    const req = httpMock.expectOne(`${baseUrl}/invoices/`);
    expect(req.request.method).toBe('GET');
    req.flush({ count: 1, results: dummyInvoices });
  });

  it('should retrieve a single invoice by ID', () => {
    const dummyInvoice: Invoice = {
      id: 1,
      numero_facture: 'FAC-2026-0001',
      commande: 10,
      nom_client_snapshot: 'Moussa Diop',
      telephone_client_snapshot: '+221770001111',
      adresse_livraison_snapshot: 'Dakar Plateau',
      montant_ht: '4500.00',
      frais_livraison: '1000.00',
      montant_total: '5500.00',
      est_payee: true,
      date_emission: '2026-09-16T20:00:00Z'
    };

    service.getInvoiceById(1).subscribe(invoice => {
      expect(invoice.numero_facture).toBe('FAC-2026-0001');
    });

    const req = httpMock.expectOne(`${baseUrl}/invoices/1/`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyInvoice);
  });

  it('should handle 401 Unauthorized error', () => {
    service.getPayments().subscribe({
      next: () => fail('Should have failed with 401'),
      error: (err) => {
        expect(err.status).toBe(401);
      }
    });

    const req = httpMock.expectOne(`${baseUrl}/transactions/`);
    req.flush('Unauthorized access', { status: 401, statusText: 'Unauthorized' });
  });

  it('should handle 400 Bad Request error', () => {
    service.initiatePayment({ commande: 99, methode: 'WAVE' }).subscribe({
      next: () => fail('Should have failed with 400'),
      error: (err) => {
        expect(err.status).toBe(400);
      }
    });

    const req = httpMock.expectOne(`${baseUrl}/transactions/`);
    req.flush({ commande: ["Commande introuvable"] }, { status: 400, statusText: 'Bad Request' });
  });
});
