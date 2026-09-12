import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GoogleAuthComponent } from './google-auth.component';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { GoogleAuthService } from '../../../../core/services/google-auth.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';

describe('GoogleAuthComponent', () => {
  let component: GoogleAuthComponent;
  let fixture: ComponentFixture<GoogleAuthComponent>;
  let googleAuthServiceSpy: jasmine.SpyObj<GoogleAuthService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let locationSpy: jasmine.SpyObj<Location>;

  beforeEach(async () => {
    googleAuthServiceSpy = jasmine.createSpyObj('GoogleAuthService', ['loadScript', 'initialize', 'prompt', 'renderButton', 'decodeToken']);
    googleAuthServiceSpy.loadScript.and.returnValue(Promise.resolve());
    googleAuthServiceSpy.credential$ = of() as any;

    authServiceSpy = jasmine.createSpyObj('AuthService', ['loginWithGoogle']);
    locationSpy = jasmine.createSpyObj('Location', ['back']);

    await TestBed.configureTestingModule({
      imports: [GoogleAuthComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: GoogleAuthService, useValue: googleAuthServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Location, useValue: locationSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GoogleAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create GoogleAuthComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize Google script on load', () => {
    expect(googleAuthServiceSpy.loadScript).toHaveBeenCalled();
  });

  it('should navigate back on back button click', () => {
    component.onBack();
    expect(locationSpy.back).toHaveBeenCalled();
  });

  it('should format continue button text dynamically based on selected account', () => {
    component.selectedAccount = {
      sub: '123',
      email: 'test@gmail.com',
      name: 'Alexandre Martin',
      givenName: 'Alexandre',
      familyName: 'Martin',
      initials: 'AM'
    };

    expect(component.continueButtonText).toBe('Continuer en tant que Alexandre');
  });

  it('should handle Google authentication success', () => {
    component.selectedAccount = {
      sub: '123',
      email: 'test@gmail.com',
      name: 'Alexandre Martin',
      givenName: 'Alexandre',
      familyName: 'Martin',
      initials: 'AM'
    };
    authServiceSpy.loginWithGoogle.and.returnValue(of({ token: 'abc' } as any));

    component.onContinue();

    expect(component.authState).toBe('loading');
    expect(authServiceSpy.loginWithGoogle).toHaveBeenCalled();
  });
});
