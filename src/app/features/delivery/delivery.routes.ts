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
    path: 'missions',
    loadComponent: () => import('./pages/delivery-home/delivery-home.component').then(m => m.DeliveryHomeComponent),
    canActivate: [driverAuthGuard]
  },
  {
    path: 'detail/:id',
    loadComponent: () => import('./pages/delivery-detail/delivery-detail.component').then(m => m.DeliveryDetailComponent),
    canActivate: [driverAuthGuard]
  },
  {
    path: 'navigation/:id',
    loadComponent: () => import('./pages/delivery-detail/delivery-detail.component').then(m => m.DeliveryDetailComponent),
    canActivate: [driverAuthGuard]
  },
  {
    path: 'detail/:orderId',
    loadComponent: () => import('./pages/delivery-detail/delivery-detail.component').then(m => m.DeliveryDetailComponent),
    canActivate: [driverAuthGuard]
  },
  {
    path: 'validation/:id',
    loadComponent: () => import('./pages/delivery-validation/delivery-validation.component').then(m => m.DeliveryValidationComponent),
    canActivate: [driverAuthGuard]
  },
  {
    path: 'validation/:orderId',
    loadComponent: () => import('./pages/delivery-validation/delivery-validation.component').then(m => m.DeliveryValidationComponent),
    canActivate: [driverAuthGuard]
  },
  {
    path: 'success/:id',
    loadComponent: () => import('./pages/delivery-success/delivery-success.component').then(m => m.DeliverySuccessComponent),
    canActivate: [driverAuthGuard]
  },
  {
    path: 'success/:orderId',
    loadComponent: () => import('./pages/delivery-success/delivery-success.component').then(m => m.DeliverySuccessComponent),
    canActivate: [driverAuthGuard]
  },
  {
    path: 'history',
    loadComponent: () => import('./pages/delivery-history/delivery-history.component').then(m => m.DeliveryHistoryComponent),
    canActivate: [driverAuthGuard]
  },
  {
    path: 'profile/edit',
    loadComponent: () => import('./pages/delivery-profile-edit/delivery-profile-edit.component').then(m => m.DeliveryProfileEditComponent),
    canActivate: [driverAuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/delivery-profile/delivery-profile.component').then(m => m.DeliveryProfileComponent),
    canActivate: [driverAuthGuard]
  }
];
