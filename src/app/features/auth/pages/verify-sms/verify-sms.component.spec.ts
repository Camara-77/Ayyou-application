import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { VerifySmsComponent } from './verify-sms.component';
import { AuthService } from '../../../../core/services/auth.service';

describe('VerifySmsComponent', () => {
  let component: VerifySmsComponent;
  let fixture: ComponentFixture<VerifySmsComponent>;
  let router: Router;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getPendingPhone', 'verifyOtp']);
    authServiceSpy.getPendingPhone.and.returnValue('+221771234567');
    authServiceSpy.verifyOtp.and.returnValue(of({ verified: true, token: 'mock-token' } as any));

    await TestBed.configureTestingModule({
      imports: [VerifySmsComponent, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VerifySmsComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    component.clearTimer();
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize with incomplete OTP code and disabled submit button', () => {
    fixture.detectChanges();
    expect(component.isOtpComplete).toBeFalse();
  });

  it('should accept 6 digits and become complete', () => {
    fixture.detectChanges();
    const digits = ['1', '2', '3', '4', '5', '6'];
    digits.forEach((d, idx) => component.digitsArray.controls[idx].setValue(d));
    expect(component.isOtpComplete).toBeTrue();
    expect(component.otpCode).toBe('123456');
  });

  it('should reject non-numeric input on input event', () => {
    fixture.detectChanges();
    const event = { target: { value: 'a' } } as any;
    component.onInput(event, 0);
    expect(component.digitsArray.controls[0].value).toBe('');
  });

  it('should manage resend timer and enable resend button after countdown', fakeAsync(() => {
    component.startResendTimer();
    expect(component.isResendDisabled).toBeTrue();
    tick(48000);
    expect(component.isResendDisabled).toBeFalse();
    expect(component.timerSeconds).toBe(0);
  }));

  it('should navigate to /location on valid mock code submit', fakeAsync(() => {
    fixture.detectChanges();
    const spy = spyOn(router, 'navigate');
    const digits = ['1', '2', '3', '4', '5', '6'];
    digits.forEach((d, idx) => component.digitsArray.controls[idx].setValue(d));

    component.onSubmit();
    tick(500);

    expect(spy).toHaveBeenCalledWith(['/location']);
  }));

  it('should navigate to /register on modify number or back click', () => {
    fixture.detectChanges();
    const spy = spyOn(router, 'navigate');
    component.onModifyNumber();
    expect(spy).toHaveBeenCalledWith(['/register']);

    component.onBack();
    expect(spy).toHaveBeenCalledWith(['/register']);
  });
});
