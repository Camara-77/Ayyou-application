import { ComponentFixture, TestBed } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule, FormsModule],
      providers: [provideRouter([]), provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with an invalid form', () => {
    expect(component.registerForm.valid).toBeFalse();
  });

  describe('PRÉNOM Validation', () => {
    it('should be invalid when empty', () => {
      const control = component.registerForm.get('firstName');
      control?.setValue('');
      expect(control?.valid).toBeFalse();
    });

    it('should be invalid when containing only digits or symbols', () => {
      const control = component.registerForm.get('firstName');
      control?.setValue('12345');
      expect(control?.valid).toBeFalse();
      control?.setValue('@@@');
      expect(control?.valid).toBeFalse();
    });

    it('should be valid with valid names including accents and hyphens', () => {
      const control = component.registerForm.get('firstName');
      control?.setValue('Amine');
      expect(control?.valid).toBeTrue();
      control?.setValue('Aïssatou');
      expect(control?.valid).toBeTrue();
      control?.setValue('Jean-Pierre');
      expect(control?.valid).toBeTrue();
    });
  });

  describe('NOM Validation', () => {
    it('should be invalid when empty', () => {
      const control = component.registerForm.get('lastName');
      control?.setValue('');
      expect(control?.valid).toBeFalse();
    });

    it('should be invalid with incoherent values', () => {
      const control = component.registerForm.get('lastName');
      control?.setValue('111');
      expect(control?.valid).toBeFalse();
    });

    it('should be valid with correct values', () => {
      const control = component.registerForm.get('lastName');
      control?.setValue('Benali');
      expect(control?.valid).toBeTrue();
    });
  });

  describe('TÉLÉPHONE Validation & Country Search', () => {
    it('should be invalid when empty', () => {
      const control = component.registerForm.get('phone');
      control?.setValue('');
      expect(control?.valid).toBeFalse();
    });

    it('should be invalid when too short or too long', () => {
      const control = component.registerForm.get('phone');
      control?.setValue('123');
      expect(control?.valid).toBeFalse();
      control?.setValue('1234567890123456');
      expect(control?.valid).toBeFalse();
    });

    it('should be invalid when containing alphabetical characters', () => {
      const control = component.registerForm.get('phone');
      control?.setValue('77abc5678');
      expect(control?.valid).toBeFalse();
    });

    it('should be valid with a valid Senegal number (+221)', () => {
      const senegal = component.allCountries.find(c => c.code === 'SN')!;
      component.selectCountry(senegal);
      const control = component.registerForm.get('phone');
      control?.setValue('77 123 45 67');
      expect(control?.valid).toBeTrue();
    });

    it('should change validation rules when changing country', () => {
      const control = component.registerForm.get('phone');
      control?.setValue('77 123 45 67');
      expect(control?.valid).toBeTrue();

      const france = component.allCountries.find(c => c.code === 'FR')!;
      component.selectCountry(france);
      expect(control?.valid).toBeFalse();

      control?.setValue('06 12 34 56 78');
      expect(control?.valid).toBeTrue();
    });

    it('should filter countries using the search query', () => {
      component.countrySearchQuery = 'France';
      expect(component.filteredCountries.length).toBeGreaterThan(0);
      expect(component.filteredCountries[0].name).toContain('France');
    });
  });

  describe('EMAIL Validation', () => {
    it('should reject incomplete or invalid email formats', () => {
      const control = component.registerForm.get('email');
      const invalidEmails = [
        '',
        'test',
        'test@',
        '@gmail.com',
        'test@gmail',
        'test@.com',
        'test@com',
        'test..test@gmail.com',
        'test@gmail..com'
      ];
      invalidEmails.forEach(email => {
        control?.setValue(email);
        expect(control?.valid).toBeFalse();
      });
    });

    it('should accept properly structured email addresses', () => {
      const control = component.registerForm.get('email');
      const validEmails = [
        'gourmet@ayyou.fr',
        'contact@gmail.com',
        'nom.prenom@yahoo.fr'
      ];
      validEmails.forEach(email => {
        control?.setValue(email);
        expect(control?.valid).toBeTrue();
      });
    });
  });

  describe('MOT DE PASSE Validation', () => {
    it('should reject passwords with less than 8 characters', () => {
      const control = component.registerForm.get('password');
      control?.setValue('Pass1!');
      expect(control?.valid).toBeFalse();
    });

    it('should reject passwords without numbers or special characters', () => {
      const control = component.registerForm.get('password');
      control?.setValue('PasswordWithoutNumbers');
      expect(control?.valid).toBeFalse();
    });

    it('should accept compliant passwords with letters, numbers, and special chars', () => {
      const control = component.registerForm.get('password');
      control?.setValue('SuperMotDePasse@2024');
      expect(control?.valid).toBeTrue();
    });
  });

  describe('CONFIRMATION Validation', () => {
    it('should be invalid when confirmation is different', () => {
      component.registerForm.get('password')?.setValue('SuperMotDePasse@2024');
      component.registerForm.get('passwordConfirmation')?.setValue('DifferentPassword@2024');
      expect(component.registerForm.hasError('passwordMismatch')).toBeTrue();
    });

    it('should be valid when confirmation matches password', () => {
      component.registerForm.get('password')?.setValue('SuperMotDePasse@2024');
      component.registerForm.get('passwordConfirmation')?.setValue('SuperMotDePasse@2024');
      expect(component.registerForm.hasError('passwordMismatch')).toBeFalse();
    });
  });

  describe('CGU Validation', () => {
    it('should be invalid when unchecked', () => {
      const control = component.registerForm.get('acceptTerms');
      control?.setValue(false);
      expect(control?.valid).toBeFalse();
    });

    it('should be valid when checked', () => {
      const control = component.registerForm.get('acceptTerms');
      control?.setValue(true);
      expect(control?.valid).toBeTrue();
    });
  });

  describe('FORMULAIRE COMPLET', () => {
    it('should make form valid when all fields contain correct data', () => {
      const senegal = component.allCountries.find(c => c.code === 'SN')!;
      component.selectCountry(senegal);
      component.registerForm.setValue({
        firstName: 'Amine',
        lastName: 'Benali',
        phone: '77 123 45 67',
        email: 'gourmet@ayyou.fr',
        password: 'SuperMotDePasse@2024',
        passwordConfirmation: 'SuperMotDePasse@2024',
        acceptTerms: true
      });
      expect(component.registerForm.valid).toBeTrue();
    });
  });
});
