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
    path: 'home',
    loadComponent: () => import('./features/client/pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'restaurant/:id',
    loadComponent: () => import('./features/client/pages/restaurant-detail/restaurant-detail.component').then(m => m.RestaurantDetailComponent)
  },
  {
    path: 'search',
    loadComponent: () => import('./features/client/pages/search/search.component').then(m => m.SearchComponent)
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/client/pages/cart/cart.component').then(m => m.CartComponent)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/client/pages/checkout/checkout.component').then(m => m.CheckoutComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/client/pages/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'profile/edit',
    loadComponent: () => import('./features/client/pages/profile-edit/profile-edit.component').then(m => m.ProfileEditComponent)
  },
  {
    path: 'favorites',
    loadComponent: () => import('./features/client/pages/favorites/favorites.component').then(m => m.FavoritesComponent)
  },
  {
    path: 'notifications',
    loadComponent: () => import('./features/client/pages/notifications/notifications.component').then(m => m.NotificationsComponent)
  },
  {
    path: 'order-history',
    loadComponent: () => import('./features/client/pages/orders-history/orders-history.component').then(m => m.OrdersHistoryComponent)
  },
  {
    path: 'orders/history',
    redirectTo: 'order-history'
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./features/client/pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
  {
    path: 'product-detail/:id',
    redirectTo: 'product/:id'
  },
  {
    path: 'order-tracking/:id',
    loadComponent: () => import('./features/client/pages/order-tracking/order-tracking.component').then(m => m.OrderTrackingComponent)
  },
  {
    path: 'order-validation/:id',
    loadComponent: () => import('./features/client/pages/order-validation/order-validation.component').then(m => m.OrderValidationComponent)
  },
  {
    path: 'terms',
    loadComponent: () => import('./features/legal/pages/terms/terms.component').then(m => m.TermsComponent)
  },
  {
    path: 'privacy',
    loadComponent: () => import('./features/legal/pages/privacy/privacy.component').then(m => m.PrivacyComponent)
  },
  {
    path: 'pro',
    loadChildren: () => import('./features/pro/pro.routes').then(m => m.PRO_ROUTES)
  },
  {
    path: 'vendeur/login',
    loadComponent: () => import('./features/pro/pages/vendor-login/vendor-login.component').then(m => m.VendorLoginComponent)
  },
  {
    path: 'vendeur',
    redirectTo: 'pro/vendor/dashboard'
  },
  {
    path: 'delivery',
    loadChildren: () => import('./features/delivery/delivery.routes').then(m => m.DELIVERY_ROUTES)
  },
  {
    path: 'livreur',
    loadChildren: () => import('./features/delivery/delivery.routes').then(m => m.DELIVERY_ROUTES)
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
