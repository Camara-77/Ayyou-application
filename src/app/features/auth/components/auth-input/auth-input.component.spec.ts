import { ComponentFixture, TestBed } from '@angular/core';
import { AuthInputComponent } from './auth-input.component';

describe('AuthInputComponent', () => {
  let component: AuthInputComponent;
  let fixture: ComponentFixture<AuthInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthInputComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle password visibility', () => {
    component.type = 'password';
    expect(component.inputType).toBe('password');
    component.togglePasswordVisibility();
    expect(component.inputType).toBe('text');
  });

  it('should write value via ControlValueAccessor', () => {
    component.writeValue('test value');
    expect(component.value).toBe('test value');
  });
});
