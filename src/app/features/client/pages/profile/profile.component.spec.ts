import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ProfileComponent } from './profile.component';
import { AuthService } from '../../../../core/services/auth.service';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
  });

  it('should create and load profile', () => {
    spyOn(authService, 'getModes').and.returnValue(of({
      active_mode: 'CLIENT',
      available_modes: ['CLIENT', 'LIVREUR'],
      can_switch_to_driver: true
    }));

    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.canSwitchToDriver).toBe(true);
  });

  it('should call switchMode on switchToDriverMode', () => {
    spyOn(authService, 'getModes').and.returnValue(of({
      active_mode: 'CLIENT',
      available_modes: ['CLIENT', 'LIVREUR'],
      can_switch_to_driver: true
    }));
    spyOn(authService, 'switchMode').and.returnValue(of({ active_mode: 'LIVREUR' }));

    fixture.detectChanges();
    component.switchToDriverMode();

    expect(authService.switchMode).toHaveBeenCalledWith('LIVREUR');
  });
});
