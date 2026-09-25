import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { DriverAuthService } from '../services/driver-auth.service';
import { AuthService } from '../../../core/services/auth.service';

export const driverAuthGuard: CanActivateFn = (route, state) => {
  const driverAuthService = inject(DriverAuthService);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated() && !driverAuthService.isAuthenticated()) {
    return router.createUrlTree(['/pro/login'], { queryParams: { returnUrl: state.url } });
  }

  const user = authService.getCurrentUser();
  if (user) {
    const isDriver = user.roles?.includes('LIVREUR') || user.activeMode === 'LIVREUR';
    if (!isDriver) {
      if (user.roles?.includes('VENDEUR')) {
        return router.createUrlTree(['/pro/vendor/dashboard']);
      }
      if (user.roles?.includes('RESTAURANT')) {
        return router.createUrlTree(['/pro/restaurant/dashboard']);
      }
      return router.createUrlTree(['/home']);
    }

    if (user.driverStatus === 'EN_ATTENTE' || (isDriver && user.proStatus === 'PENDING' && user.driverStatus !== 'VALIDE')) {
      return router.createUrlTree(['/pro/onboarding/pending']);
    }
    if (user.driverStatus === 'REFUSE' || (isDriver && user.proStatus === 'REJECTED' && user.driverStatus !== 'VALIDE')) {
      return router.createUrlTree(['/pro/onboarding/rejected']);
    }
    if (isDriver && (user.driverStatus === 'VALIDE' || (user.proStatus === 'APPROVED' && (user.driverStatus as any) !== 'REFUSE'))) {
      return true;
    }
  }

  if (driverAuthService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/pro/login'], { queryParams: { returnUrl: state.url } });
};

