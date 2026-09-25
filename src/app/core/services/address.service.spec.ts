import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AddressService } from './address.service';
import { environment } from '../../../environments/environment';
import { BackendAddress } from '../models/orders';

describe('AddressService', () => {
  let service: AddressService;
  let httpMock: HttpTestingController;

  const mockAddress: BackendAddress = {
    id: 1,
    titre: 'Maison',
    adresse: 'Point E, Dakar',
    latitude: 14.6925,
    longitude: -17.4611,
    est_defaut: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AddressService]
    });
    service = TestBed.inject(AddressService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('6. Récupération des adresses (getAddresses)', () => {
    service.getAddresses().subscribe(addresses => {
      expect(addresses.length).toBe(1);
      expect(addresses[0].titre).toBe('Maison');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/orders/addresses/`);
    expect(req.request.method).toBe('GET');
    req.flush([mockAddress]);
  });

  it('7. Création d\'une adresse (createAddress)', () => {
    service.createAddress({ titre: 'Bureau', adresse: 'Plateau' }).subscribe(res => {
      expect(res.id).toBe(2);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/orders/addresses/`);
    expect(req.request.method).toBe('POST');
    req.flush({ id: 2, titre: 'Bureau', adresse: 'Plateau', est_defaut: false });
  });

  it('8. Modification d\'une adresse (updateAddress)', () => {
    service.updateAddress(1, { titre: 'Maison Pro' }).subscribe(res => {
      expect(res.titre).toBe('Maison Pro');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/orders/addresses/1/`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ ...mockAddress, titre: 'Maison Pro' });
  });

  it('9. Suppression d\'une adresse (deleteAddress)', () => {
    service.deleteAddress(1).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/orders/addresses/1/`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('10. Définition d\'une adresse par défaut (setDefaultAddress)', () => {
    service.setDefaultAddress(1).subscribe(res => {
      expect(res.est_defaut).toBeTrue();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/orders/addresses/1/set-default/`);
    expect(req.request.method).toBe('POST');
    req.flush({ ...mockAddress, est_defaut: true });
  });
});
