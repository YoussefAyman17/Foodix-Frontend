import { Routes } from '@angular/router';

import { RegisterPage } from './Components/register-page/register-page';
import { LoginPage } from './Components/login-page/login-page';
import { ForgotPasswordPage } from './Components/forgot-password-page/forgot-password-page';
import { VerifyCodePage } from './Components/verify-code-page/verify-code-page';
import { ResetPasswordPage } from './Components/reset-password-page/reset-password-page';

import { Home } from './Components/home/home';
import { Menu } from './Components/menu/menu';
import { ProfilePage } from './Components/profile-page/profile-page';
import { MyOrdersPage } from './Components/my-orders-page/my-orders-page';
import { ProductDetails } from './Components/product-details/product-details';
import { adminGuard } from './admin/guards/admin-guard';

export const routes: Routes = [
  // Auth routes
  { path: 'signUp', component: RegisterPage, title: 'Register Page' },
  { path: 'login', component: LoginPage, title: 'Login page' },
  { path: '', component: LoginPage, title: 'Login page' },
  { path: 'forgotPassword', component: ForgotPasswordPage, title: 'Forgot Password Page' },
  { path: 'verifyCode', component: VerifyCodePage, title: 'Verify Code Page' },
  { path: 'resetPassword', component: ResetPasswordPage, title: 'Reset Password Page' },

  // App routes
  { path: 'home', component: Home, title: 'Home' },
  { path: 'menu', component: Menu, title: 'Menu' },
  { path: 'product/:slug/:id', component: ProductDetails, title: 'Product Details' },
  { path: 'profile', component: ProfilePage, title: 'profile' },
  { path: 'my-orders-page', component: MyOrdersPage, title: 'My Orders' },

  // Admin routes
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () => import('./admin/admin-module').then((m) => m.AdminModule),
  },
];
