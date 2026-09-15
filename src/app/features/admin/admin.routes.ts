import { Routes } from '@angular/router';
import { adminAuthGuard } from './guards/admin-auth.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/admin-login/admin-login.component').then(m => m.AdminLoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [adminAuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/admin-users/admin-users.component').then(m => m.AdminUsersComponent)
      },
      {
        path: 'businesses',
        loadComponent: () => import('./pages/admin-businesses/admin-businesses.component').then(m => m.AdminBusinessesComponent)
      },
      {
        path: 'applications',
        loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'applications/:id',
        loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'drivers',
        loadComponent: () => import('./pages/admin-drivers/admin-drivers.component').then(m => m.AdminDriversComponent)
      },
      {
        path: 'livreurs',
        loadComponent: () => import('./pages/admin-drivers/admin-drivers.component').then(m => m.AdminDriversComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./pages/admin-orders/admin-orders.component').then(m => m.AdminOrdersComponent)
      },
      {
        path: 'commandes',
        loadComponent: () => import('./pages/admin-orders/admin-orders.component').then(m => m.AdminOrdersComponent)
      },
      {
        path: 'deliveries',
        loadComponent: () => import('./pages/admin-deliveries/admin-deliveries.component').then(m => m.AdminDeliveriesComponent)
      },
      {
        path: 'livraisons',
        loadComponent: () => import('./pages/admin-deliveries/admin-deliveries.component').then(m => m.AdminDeliveriesComponent)
      },
      {
        path: 'catalog',
        loadComponent: () => import('./pages/admin-catalog/admin-catalog.component').then(m => m.AdminCatalogComponent)
      },
      {
        path: 'catalogue',
        loadComponent: () => import('./pages/admin-catalog/admin-catalog.component').then(m => m.AdminCatalogComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./pages/admin-categories/admin-categories.component').then(m => m.AdminCategoriesComponent)
      },
      {
        path: 'payments',
        loadComponent: () => import('./pages/admin-payments/admin-payments.component').then(m => m.AdminPaymentsComponent)
      },
      {
        path: 'paiements',
        loadComponent: () => import('./pages/admin-payments/admin-payments.component').then(m => m.AdminPaymentsComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/admin-settings/admin-settings.component').then(m => m.AdminSettingsComponent)
      },
      {
        path: 'parametres',
        loadComponent: () => import('./pages/admin-settings/admin-settings.component').then(m => m.AdminSettingsComponent)
      }
    ]
  }
];
