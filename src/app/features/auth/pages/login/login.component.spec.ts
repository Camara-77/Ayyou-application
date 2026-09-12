import { ComponentFixture, TestBed } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [provideRouter([]), provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with an invalid form', () => {
    expect(component.loginForm.valid).toBeFalse();
  });

  it('should validate identifier field as required', () => {
    const control = component.loginForm.get('identifier');
    expect(control?.valid).toBeFalse();
    expect(control?.errors?.['required']).toBeTrue();

    control?.setValue('user@example.com');
    expect(control?.valid).toBeTrue();
  });

  it('should validate password field as required', () => {
    const control = component.loginForm.get('password');
    expect(control?.valid).toBeFalse();
    expect(control?.errors?.['required']).toBeTrue();

    control?.setValue('secret123');
    expect(control?.valid).toBeTrue();
  });

  it('should make form valid when both identifier and password are provided', () => {
    component.loginForm.get('identifier')?.setValue('user@example.com');
    component.loginForm.get('password')?.setValue('secret123');
    expect(component.loginForm.valid).toBeTrue();
  });

  it('should render the login button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('app-auth-button');
    expect(button).toBeTruthy();
  });
});
