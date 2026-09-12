import { ComponentFixture, TestBed } from '@angular/core';
import { SocialLoginButtonComponent } from './social-login-button.component';

describe('SocialLoginButtonComponent', () => {
  let component: SocialLoginButtonComponent;
  let fixture: ComponentFixture<SocialLoginButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialLoginButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SocialLoginButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit socialClick with provider name', () => {
    spyOn(component.socialClick, 'emit');
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(component.socialClick.emit).toHaveBeenCalledWith('google');
  });
});
