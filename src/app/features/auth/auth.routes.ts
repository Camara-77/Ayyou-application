import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'onboarding',
    loadComponent: () => import('./pages/onboarding/onboarding.component').then(m => m.OnboardingComponent)
  },
  {
    path: 'welcome',
    redirectTo: 'onboarding',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'verify-sms',
    loadComponent: () => import('./pages/verify-sms/verify-sms.component').then(m => m.VerifySmsComponent)
  },
  {
    path: 'location',
    loadComponent: () => import('./pages/location/location.component').then(m => m.LocationComponent)
  },
  {
    path: 'google-auth',
    loadComponent: () => import('./pages/google-auth/google-auth.component').then(m => m.GoogleAuthComponent)
  }
];
