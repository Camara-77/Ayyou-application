import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProAuthService } from '../services/pro-auth.service';

export const proGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const proAuthService = inject(ProAuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/pro/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  const user = authService.getCurrentUser();
  if (!user) {
    return router.createUrlTree(['/pro/login']);
  }

  const etabType = user.etablissement?.type_etablissement;
  const isLivreur = user.roles?.includes('LIVREUR') || user.activeMode === 'LIVREUR';
  const isVendeur = user.roles?.includes('VENDEUR') || etabType === 'VENDEUR';

  if (isLivreur) {
    return router.createUrlTree(['/delivery/home']);
  }

  if (isVendeur) {
    return router.createUrlTree(['/pro/vendor/dashboard']);
  }

  const isRestaurant = user.roles?.includes('RESTAURANT') || etabType === 'RESTAURANT' || (!isLivreur && !isVendeur && user.roles?.some(r => r === 'RESTAURANT'));
  if (!isRestaurant) {
    return router.createUrlTree(['/home']);
  }

  if (user.merchantStatus === 'EN_ATTENTE' || (isRestaurant && user.proStatus === 'PENDING' && user.merchantStatus !== 'VALIDE')) {
    return router.createUrlTree(['/pro/onboarding/pending']);
  }

  if (user.merchantStatus === 'REFUSE' || (isRestaurant && user.proStatus === 'REJECTED' && user.merchantStatus !== 'VALIDE')) {
    return router.createUrlTree(['/pro/onboarding/rejected']);
  }

  if (isRestaurant && (user.merchantStatus === 'VALIDE' || (user.proStatus === 'APPROVED' && (user.merchantStatus as any) !== 'REFUSE') || proAuthService.isAuthenticated())) {
    return true;
  }

  return router.createUrlTree(['/pro/onboarding/pending']);
};
