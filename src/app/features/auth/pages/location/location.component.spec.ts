import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocationComponent } from './location.component';
import { Router } from '@angular/router';

describe('LocationComponent', () => {
  let component: LocationComponent;
  let fixture: ComponentFixture<LocationComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LocationComponent],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create LocationComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate back to /verify-sms when onBack is called', () => {
    component.onBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/verify-sms']);
  });

  it('should handle requestLocation when navigator.geolocation is available', () => {
    const mockGeolocation = {
      getCurrentPosition: jasmine.createSpy('getCurrentPosition').and.callFake((successCallback) => {
        successCallback({
          coords: {
            latitude: 33.5731,
            longitude: -7.5898
          }
        });
      })
    };
    spyOnProperty(navigator, 'geolocation', 'get').and.returnValue(mockGeolocation as any);

    component.requestLocation();

    expect(component.locationGranted).toBeTrue();
    expect(component.latitude).toBe(33.5731);
    expect(component.longitude).toBe(-7.5898);
  });

  it('should handle permission denied error in requestLocation', () => {
    const mockGeolocation = {
      getCurrentPosition: jasmine.createSpy('getCurrentPosition').and.callFake((_, errorCallback) => {
        errorCallback({
          code: 1, // PERMISSION_DENIED
          PERMISSION_DENIED: 1
        });
      })
    };
    spyOnProperty(navigator, 'geolocation', 'get').and.returnValue(mockGeolocation as any);

    component.requestLocation();

    expect(component.locationGranted).toBeFalse();
    expect(component.locationError).toContain('refusé');
  });

  it('should execute skipForNow and enterAddressManually without errors', () => {
    expect(() => component.skipForNow()).not.toThrow();
    expect(() => component.enterAddressManually()).not.toThrow();
  });
});
