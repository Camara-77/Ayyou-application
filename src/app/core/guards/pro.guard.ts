import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ProAuthService } from '../services/pro-auth.service';

export const proGuard: CanActivateFn = (route, state) => {
  const proAuthService = inject(ProAuthService);
  const router = inject(Router);

  if (proAuthService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/pro/login'], {
    queryParams: { returnUrl: state.url }
  });
};
