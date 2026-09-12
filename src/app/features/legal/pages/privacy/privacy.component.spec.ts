import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrivacyComponent } from './privacy.component';
import { provideRouter, Router } from '@angular/router';

describe('PrivacyComponent', () => {
  let component: PrivacyComponent;
  let fixture: ComponentFixture<PrivacyComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [PrivacyComponent],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PrivacyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create PrivacyComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should display the title of Privacy Policy', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.legal-page__title')?.textContent).toContain("Politique de confidentialité");
  });

  it('should navigate to /login on back button click', () => {
    component.onBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
