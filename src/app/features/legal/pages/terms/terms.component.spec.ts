import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TermsComponent } from './terms.component';
import { provideRouter, Router } from '@angular/router';

describe('TermsComponent', () => {
  let component: TermsComponent;
  let fixture: ComponentFixture<TermsComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [TermsComponent],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TermsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create TermsComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should display the main title of CGU/CGV', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.legal-page__title')?.textContent).toContain("Conditions Générales d'Utilisation");
  });

  it('should navigate to /login on back button click', () => {
    component.onBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
