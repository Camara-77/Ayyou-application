import { Routes } from '@angular/router';
import { vendorAuthGuard } from './guards/vendor-auth.guard';

export const PRO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./public/home/pro-public-home.component').then(m => m.ProPublicHomeComponent)
  },

  // Auth PRO
  {
    path: 'login',
    loadComponent: () => import('./pages/pro-login/pro-login.component').then(m => m.ProLoginComponent)
  },
  {
    path: 'vendor/login',
    loadComponent: () => import('./pages/vendor-login/vendor-login.component').then(m => m.VendorLoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/pro-register.component').then(m => m.ProRegisterComponent)
  },
  {
    path: 'register/confirmation',
    loadComponent: () => import('./auth/register-confirmation/pro-register-confirmation.component').then(m => m.ProRegisterConfirmationComponent)
  },

  // Espace Restaurant
  {
    path: 'restaurant/dashboard',
    loadComponent: () => import('./pages/pro-dashboard/pro-dashboard.component').then(m => m.ProDashboardComponent)
  },
  {
    path: 'restaurant/orders',
    loadComponent: () => import('./pages/pro-order-history/pro-order-history.component').then(m => m.ProOrderHistoryComponent)
  },
  {
    path: 'restaurant/statistics',
    loadComponent: () => import('./pages/pro-statistics/pro-statistics.component').then(m => m.ProStatisticsComponent)
  },
  {
    path: 'restaurant/studio',
    loadComponent: () => import('./pages/pro-studio/pro-studio-upload.component').then(m => m.ProStudioUploadComponent)
  },
  {
    path: 'restaurant/menu',
    loadComponent: () => import('./pages/pro-dashboard/pro-dashboard.component').then(m => m.ProDashboardComponent)
  },
  {
    path: 'restaurant/profile',
    loadComponent: () => import('./pages/pro-profile/pro-profile.component').then(m => m.ProProfileComponent)
  },
  {
    path: 'restaurant/notifications',
    loadComponent: () => import('./pages/pro-notifications/pro-notifications.component').then(m => m.ProNotificationsComponent)
  },

  // Espace Vendeur
  {
    path: 'vendor/dashboard',
    loadComponent: () => import('./pages/pro-dashboard/pro-dashboard.component').then(m => m.ProDashboardComponent),
    canActivate: [vendorAuthGuard]
  },
  {
    path: 'vendor/orders',
    loadComponent: () => import('./pages/pro-order-history/pro-order-history.component').then(m => m.ProOrderHistoryComponent),
    canActivate: [vendorAuthGuard]
  },
  {
    path: 'vendor/statistics',
    loadComponent: () => import('./pages/pro-statistics/pro-statistics.component').then(m => m.ProStatisticsComponent),
    canActivate: [vendorAuthGuard]
  },
  {
    path: 'vendor/studio',
    loadComponent: () => import('./pages/pro-studio/pro-studio-upload.component').then(m => m.ProStudioUploadComponent),
    canActivate: [vendorAuthGuard]
  },
  {
    path: 'vendor/menu',
    loadComponent: () => import('./pages/pro-dashboard/pro-dashboard.component').then(m => m.ProDashboardComponent),
    canActivate: [vendorAuthGuard]
  },
  {
    path: 'vendor/profile',
    loadComponent: () => import('./pages/pro-profile/pro-profile.component').then(m => m.ProProfileComponent),
    canActivate: [vendorAuthGuard]
  },
  {
    path: 'vendor/notifications',
    loadComponent: () => import('./pages/pro-notifications/pro-notifications.component').then(m => m.ProNotificationsComponent),
    canActivate: [vendorAuthGuard]
  },

  // Espace Livreur under /pro/delivery/
  {
    path: 'delivery',
    loadChildren: () => import('../delivery/delivery.routes').then(m => m.DELIVERY_ROUTES)
  },

  // Existing legacy PRO shortcuts
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/pro-dashboard/pro-dashboard.component').then(m => m.ProDashboardComponent)
  },
  {
    path: 'orders/history',
    loadComponent: () => import('./pages/pro-order-history/pro-order-history.component').then(m => m.ProOrderHistoryComponent)
  },
  {
    path: 'statistics',
    loadComponent: () => import('./pages/pro-statistics/pro-statistics.component').then(m => m.ProStatisticsComponent)
  },
  {
    path: 'studio',
    loadComponent: () => import('./pages/pro-studio/pro-studio-upload.component').then(m => m.ProStudioUploadComponent)
  },
  {
    path: 'studio/success',
    loadComponent: () => import('./pages/pro-studio/pro-studio-success.component').then(m => m.ProStudioSuccessComponent)
  },
  {
    path: 'studio/preview',
    loadComponent: () => import('./pages/pro-studio/pro-studio-preview.component').then(m => m.ProStudioPreviewComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/pro-profile/pro-profile.component').then(m => m.ProProfileComponent)
  },
  {
    path: 'profile/edit',
    loadComponent: () => import('./pages/pro-profile-edit/pro-profile-edit.component').then(m => m.ProProfileEditComponent)
  },
  {
    path: 'menu/add',
    loadComponent: () => import('./pages/pro-menu-edit/pro-menu-edit.component').then(m => m.ProMenuEditComponent)
  },
  {
    path: 'menu/:id/edit',
    loadComponent: () => import('./pages/pro-menu-edit/pro-menu-edit.component').then(m => m.ProMenuEditComponent)
  },
  {
    path: 'notifications',
    loadComponent: () => import('./pages/pro-notifications/pro-notifications.component').then(m => m.ProNotificationsComponent)
  }
];
