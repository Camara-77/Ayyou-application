import { Routes } from '@angular/router';
import { AUTH_ROUTES } from './features/auth/auth.routes';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  ...AUTH_ROUTES,
  {
    path: 'terms',
    loadComponent: () => import('./features/legal/pages/terms/terms.component').then(m => m.TermsComponent)
  },
  {
    path: 'privacy',
    loadComponent: () => import('./features/legal/pages/privacy/privacy.component').then(m => m.PrivacyComponent)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
