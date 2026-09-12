import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthHeaderComponent } from './auth-header.component';

describe('AuthHeaderComponent', () => {
  let component: AuthHeaderComponent;
  let fixture: ComponentFixture<AuthHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthHeaderComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit backClicked when back button is clicked', () => {
    spyOn(component.backClicked, 'emit');
    component.showBackButton = true;
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('.auth-header__btn');
    btn.click();

    expect(component.backClicked.emit).toHaveBeenCalled();
  });

  it('should emit skipClicked when skip button is clicked', () => {
    spyOn(component.skipClicked, 'emit');
    component.showSkipButton = true;
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('.auth-header__skip-btn');
    btn.click();

    expect(component.skipClicked.emit).toHaveBeenCalled();
  });
});
