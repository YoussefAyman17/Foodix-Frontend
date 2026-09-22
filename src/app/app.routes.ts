import { Routes } from '@angular/router';

import { MainLayout } from './layouts/main-layout/main-layout';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { adminGuard } from './admin/guards/admin-guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        loadComponent: () => import('./Components/home/home').then((m) => m.Home),
        title: 'Home Page',
      },
      {
        path: 'menu',
        loadComponent: () => import('./Components/menu/menu').then((m) => m.Menu),
        title: 'Menu Page',
      },
      {
        path: 'meal/:id',
        loadComponent: () =>
          import('./Components/product-details/product-details').then((m) => m.ProductDetails),
        title: 'Meal Details Page',
      },
      {
        path: 'complaint',
        loadComponent: () => import('./Components/contact/contact').then((m) => m.ContactComponent),
        title: 'Complaint Page',
      },
      {
        path: 'checkout',
        loadComponent: () =>
          import('./Components/checkout/checkout').then((m) => m.CheckoutComponent),
        title: 'Checkout Page',
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./Components/profile-page/profile-page').then((m) => m.ProfilePage),
        title: 'Profile Page',
      },
      {
        path: 'my-orders-page',
        loadComponent: () =>
          import('./Components/my-orders-page/my-orders-page').then((m) => m.MyOrdersPage),
        title: 'My Orders Page',
      },
    ],
  },

  // Auth routes (Lazy Loaded)
  {
    path: '',
    component: AuthLayout,
    children: [
      {
        path: 'signUp',
        loadComponent: () =>
          import('./Components/register-page/register-page').then((m) => m.RegisterPage),
        title: 'Register Page',
      },
      {
        path: 'login',
        loadComponent: () => import('./Components/login-page/login-page').then((m) => m.LoginPage),
        title: 'Login Page',
      },
      {
        path: 'forgotPassword',
        loadComponent: () =>
          import('./Components/forgot-password-page/forgot-password-page').then(
            (m) => m.ForgotPasswordPage,
          ),
        title: 'Forgot Password Page',
      },
      {
        path: 'verifyCode',
        loadComponent: () =>
          import('./Components/verify-code-page/verify-code-page').then((m) => m.VerifyCodePage),
        title: 'Verify Code Page',
      },
      {
        path: 'resetPassword',
        loadComponent: () =>
          import('./Components/reset-password-page/reset-password-page').then(
            (m) => m.ResetPasswordPage,
          ),
        title: 'Reset Password Page',
      },
    ],
  },

  // Main App routes (Lazy Loaded)

  // Delivery routes
  {
    path: 'delivery-home',
    loadComponent: () =>
      import('./Components/delivery/delivery-home/delivery-home').then((m) => m.DeliveryHome),
    title: 'Delivery Home Page',
  },

  // Admin routes
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () => import('./admin/admin-module').then((m) => m.AdminModule),
  },

  // 404 Route
  {
    path: '**',
    loadComponent: () => import('./Components/not-found/not-found').then((m) => m.NotFound),
    title: 'Page Not Found',
  },
];
