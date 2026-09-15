import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { VendorAuthService } from '../services/vendor-auth.service';

export const vendorAuthGuard: CanActivateFn = (route, state) => {
  const vendorAuthService = inject(VendorAuthService);
  const router = inject(Router);

  if (vendorAuthService.isAuthenticated()) {
    return true;
  }

  // Redirect unauthenticated vendor to /vendeur/login
  return router.createUrlTree(['/vendeur/login'], { queryParams: { returnUrl: state.url } });
};
