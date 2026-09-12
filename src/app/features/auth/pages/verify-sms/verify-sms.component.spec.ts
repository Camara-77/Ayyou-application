import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { VerifySmsComponent } from './verify-sms.component';

describe('VerifySmsComponent', () => {
  let component: VerifySmsComponent;
  let fixture: ComponentFixture<VerifySmsComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifySmsComponent, ReactiveFormsModule],
      providers: [provideRouter([]), provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(VerifySmsComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    component.clearTimer();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with incomplete OTP code and disabled submit button', () => {
    expect(component.isOtpComplete).toBeFalse();
  });

  it('should accept 6 digits and become complete', () => {
    const digits = ['1', '2', '3', '4', '5', '6'];
    digits.forEach((d, idx) => component.digitsArray.controls[idx].setValue(d));
    expect(component.isOtpComplete).toBeTrue();
    expect(component.otpCode).toBe('123456');
  });

  it('should reject non-numeric input on input event', () => {
    const event = { target: { value: 'a' } } as any;
    component.onInput(event, 0);
    expect(component.digitsArray.controls[0].value).toBe('');
  });

  it('should manage resend timer and enable resend button after countdown', fakeAsync(() => {
    expect(component.isResendDisabled).toBeTrue();
    tick(48000); // Advance 48 seconds
    expect(component.isResendDisabled).toBeFalse();
    expect(component.timerSeconds).toBe(0);
  }));

  it('should navigate to /location on valid mock code submit', fakeAsync(() => {
    const spy = spyOn(router, 'navigate');
    const digits = ['1', '2', '3', '4', '5', '6'];
    digits.forEach((d, idx) => component.digitsArray.controls[idx].setValue(d));

    component.onSubmit();
    tick(500);

    expect(spy).toHaveBeenCalledWith(['/location']);
  }));

  it('should navigate to /register on modify number or back click', () => {
    const spy = spyOn(router, 'navigate');
    component.onModifyNumber();
    expect(spy).toHaveBeenCalledWith(['/register']);

    component.onBack();
    expect(spy).toHaveBeenCalledWith(['/register']);
  });
});
