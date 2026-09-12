import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OnboardingComponent } from './onboarding.component';
import { Router } from '@angular/router';

describe('OnboardingComponent', () => {
  let component: OnboardingComponent;
  let fixture: ComponentFixture<OnboardingComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [OnboardingComponent],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create OnboardingComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should display the slogan "L\'art de bien manger à Dakar"', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.onboarding-page__slogan')?.textContent).toContain("L'art de bien manger à Dakar");
  });

  it('should navigate to /login when onContinue is called', () => {
    component.onContinue();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should navigate to /login when onLogin is called', () => {
    component.onLogin();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
