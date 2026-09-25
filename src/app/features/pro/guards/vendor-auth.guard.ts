import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { VendorAuthService } from '../services/vendor-auth.service';
import { AuthService } from '../../../core/services/auth.service';

export const vendorAuthGuard: CanActivateFn = (route, state) => {
  const vendorAuthService = inject(VendorAuthService);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated() && !vendorAuthService.isAuthenticated()) {
    return router.createUrlTree(['/vendeur/login'], { queryParams: { returnUrl: state.url } });
  }

  const user = authService.getCurrentUser();
  if (user) {
    const etabType = user.etablissement?.type_etablissement;
    const isVendor = user.roles?.includes('VENDEUR') || etabType === 'VENDEUR';

    if (!isVendor) {
      if (user.roles?.includes('LIVREUR') || user.activeMode === 'LIVREUR') {
        return router.createUrlTree(['/delivery/home']);
      }
      if (user.roles?.includes('RESTAURANT') || etabType === 'RESTAURANT') {
        return router.createUrlTree(['/pro/restaurant/dashboard']);
      }
      return router.createUrlTree(['/home']);
    }

    if (user.merchantStatus === 'EN_ATTENTE' || (isVendor && user.proStatus === 'PENDING' && user.merchantStatus !== 'VALIDE')) {
      return router.createUrlTree(['/pro/onboarding/pending']);
    }
    if (user.merchantStatus === 'REFUSE' || (isVendor && user.proStatus === 'REJECTED' && user.merchantStatus !== 'VALIDE')) {
      return router.createUrlTree(['/pro/onboarding/rejected']);
    }
    if (isVendor && (user.merchantStatus === 'VALIDE' || (user.proStatus === 'APPROVED' && (user.merchantStatus as any) !== 'REFUSE'))) {
      return true;
    }
  }

  if (vendorAuthService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/vendeur/login'], { queryParams: { returnUrl: state.url } });
};
