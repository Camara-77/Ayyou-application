import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export type UserRole = 'CLIENT' | 'RESTAURANT' | 'VENDOR' | 'DELIVERY' | 'ADMIN';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const currentUser = authService.getCurrentUser();
    const userRole = (currentUser?.role || 'CLIENT').toUpperCase() as UserRole;

    if (authService.isAuthenticated() && allowedRoles.includes(userRole)) {
      return true;
    }

    // Role-based default redirection fallback
    if (userRole === 'ADMIN') {
      return router.createUrlTree(['/admin/dashboard']);
    } else if (userRole === 'RESTAURANT') {
      return router.createUrlTree(['/pro/restaurant/dashboard']);
    } else if (userRole === 'VENDOR') {
      return router.createUrlTree(['/pro/vendor/dashboard']);
    } else if (userRole === 'DELIVERY') {
      return router.createUrlTree(['/pro/delivery/home']);
    }

    return router.createUrlTree(['/login']);
  };
};
