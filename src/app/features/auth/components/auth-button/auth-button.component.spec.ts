import { ComponentFixture, TestBed } from '@angular/core';
import { AuthButtonComponent } from './auth-button.component';

describe('AuthButtonComponent', () => {
  let component: AuthButtonComponent;
  let fixture: ComponentFixture<AuthButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit buttonClick event when clicked', () => {
    spyOn(component.buttonClick, 'emit');
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(component.buttonClick.emit).toHaveBeenCalled();
  });

  it('should not emit buttonClick when disabled or loading', () => {
    spyOn(component.buttonClick, 'emit');
    component.disabled = true;
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(component.buttonClick.emit).not.toHaveBeenCalled();
  });
});
