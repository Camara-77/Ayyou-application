import { Routes } from '@angular/router';
import { driverAuthGuard } from './guards/driver-auth.guard';

export const DELIVERY_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/driver-login/driver-login.component').then(m => m.DriverLoginComponent)
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/delivery-home/delivery-home.component').then(m => m.DeliveryHomeComponent),
    canActivate: [driverAuthGuard]
  },
  {
    path: 'navigation/:orderId',
    loadComponent: () => import('./pages/delivery-navigation/delivery-navigation.component').then(m => m.DeliveryNavigationComponent),
    canActivate: [driverAuthGuard]
  },
  {
    path: 'navigation',
    redirectTo: 'navigation/delivery-9482'
  },
  {
    path: 'arrival/:orderId',
    loadComponent: () => import('./pages/delivery-arrival/delivery-arrival.component').then(m => m.DeliveryArrivalComponent),
    canActivate: [driverAuthGuard]
  },
  {
    path: 'arrival',
    redirectTo: 'arrival/delivery-9482'
  },
  {
    path: 'validation/:orderId',
    loadComponent: () => import('./pages/delivery-validation/delivery-validation.component').then(m => m.DeliveryValidationComponent),
    canActivate: [driverAuthGuard]
  },
  {
    path: 'validation',
    redirectTo: 'validation/delivery-9482'
  },
  {
    path: 'detail/:orderId',
    loadComponent: () => import('./pages/delivery-detail/delivery-detail.component').then(m => m.DeliveryDetailComponent),
    canActivate: [driverAuthGuard]
  },
  {
    path: 'detail',
    redirectTo: 'detail/delivery-9482'
  },
  {
    path: 'completed/:orderId',
    redirectTo: 'detail/:orderId'
  },
  {
    path: 'completed',
    redirectTo: 'detail/delivery-9482'
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/delivery-profile/delivery-profile.component').then(m => m.DeliveryProfileComponent),
    canActivate: [driverAuthGuard]
  },
  {
    path: 'history',
    loadComponent: () => import('./pages/delivery-history/delivery-history.component').then(m => m.DeliveryHistoryComponent),
    canActivate: [driverAuthGuard]
  },
  {
    path: 'gains',
    redirectTo: 'history'
  }
];
