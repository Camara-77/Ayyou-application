import { TestBed } from '@angular/core';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
  });

  it('should allow access when user is authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect(result).toBeTrue();
  });

  it('should redirect to /login when user is not authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});
