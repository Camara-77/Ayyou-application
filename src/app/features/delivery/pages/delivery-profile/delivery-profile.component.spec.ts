import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DeliveryProfileComponent } from './delivery-profile.component';
import { DeliveryService } from '../../../../core/services/delivery.service';
import { LivreurProfile, LivreurDocument } from '../../../../core/models/delivery';

describe('DeliveryProfileComponent', () => {
  let component: DeliveryProfileComponent;
  let fixture: ComponentFixture<DeliveryProfileComponent>;
  let deliveryService: DeliveryService;

  const mockProfile: LivreurProfile = {
    id: 1,
    user: 10,
    prenom: 'Moussa',
    nom: 'Diallo',
    numero_telephone: '+221771234567',
    statut_verification: 'VALIDE',
    statut_verification_display: 'Validé',
    est_disponible: true,
    type_vehicule: 'SCOOTER',
    type_vehicule_display: 'Scooter / Moto',
    immatriculation: 'DK-1234-AB',
    secteur_intervention: 'Dakar Plateau',
    compte_reversement: 'Wave Sénégal',
    telephone_reversement: '+221771234567'
  };

  const mockDocuments: LivreurDocument[] = [
    {
      id: 1,
      type_document: 'CNI',
      type_document_display: 'Carte Nationale d\'Identité',
      statut: 'VALIDE',
      statut_display: 'Validé',
      commentaire: 'Document conforme'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryProfileComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DeliveryProfileComponent);
    component = fixture.componentInstance;
    deliveryService = TestBed.inject(DeliveryService);
  });

  it('should create and load profile and documents', () => {
    spyOn(deliveryService, 'getDriverProfile').and.returnValue(of(mockProfile));
    spyOn(deliveryService, 'getDriverDocuments').and.returnValue(of(mockDocuments));

    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.profile).toEqual(mockProfile);
    expect(component.driverName).toBe('Moussa Diallo');
    expect(component.isOnDuty).toBe(true);
    expect(component.documents.length).toBe(1);
  });

  it('should handle profile load error gracefully', () => {
    spyOn(deliveryService, 'getDriverProfile').and.returnValue(
      throwError(() => ({ status: 500 }))
    );
    spyOn(deliveryService, 'getDriverDocuments').and.returnValue(of([]));

    fixture.detectChanges();

    expect(component.errorMessage).toBe('Impossible de charger le profil livreur.');
    expect(component.isLoading).toBe(false);
  });

  it('should update availability when driver is validated', () => {
    spyOn(deliveryService, 'getDriverProfile').and.returnValue(of(mockProfile));
    spyOn(deliveryService, 'getDriverDocuments').and.returnValue(of([]));
    const updatedProfile = { ...mockProfile, est_disponible: false };
    spyOn(deliveryService, 'updateAvailability').and.returnValue(of(updatedProfile));

    fixture.detectChanges();
    component.toggleOnDuty();

    expect(deliveryService.updateAvailability).toHaveBeenCalledWith(false);
    expect(component.isOnDuty).toBe(false);
  });

  it('should prevent availability update when profile is not validated', () => {
    const unvalidatedProfile: LivreurProfile = {
      ...mockProfile,
      statut_verification: 'EN_ATTENTE',
      est_disponible: false
    };
    spyOn(deliveryService, 'getDriverProfile').and.returnValue(of(unvalidatedProfile));
    spyOn(deliveryService, 'getDriverDocuments').and.returnValue(of([]));
    spyOn(deliveryService, 'updateAvailability');

    fixture.detectChanges();
    component.toggleOnDuty();

    expect(deliveryService.updateAvailability).not.toHaveBeenCalled();
    expect(component.toggleError).toContain('Votre profil doit être validé');
  });
});
