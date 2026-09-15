import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { DriverAuthService } from '../services/driver-auth.service';

export const driverAuthGuard: CanActivateFn = (route, state) => {
  const driverAuthService = inject(DriverAuthService);
  const router = inject(Router);

  if (driverAuthService.isAuthenticated()) {
    return true;
  }

  // Redirect unauthenticated driver to /livreur/login
  return router.createUrlTree(['/livreur/login'], { queryParams: { returnUrl: state.url } });
};
