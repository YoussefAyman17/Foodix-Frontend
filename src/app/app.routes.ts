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
import { NotFound } from './Components/not-found/not-found';
import { DeliveryHome } from './Components/delivery/delivery-home/delivery-home';
import { ContactComponent } from './Components/contact/contact';
import { CheckoutComponent } from './Components/checkout/checkout';

// ✅ إضافة Contact و Checkout
import { ContactComponent } from './Components/contact/contact';
import { CheckoutComponent } from './Components/checkout/checkout';

export const routes: Routes = [
  // Auth routes
  { path: 'signUp',         component: RegisterPage,       title: 'Register Page' },
  { path: 'login',          component: LoginPage,           title: 'Login Page' },
  { path: '',               component: LoginPage,           title: 'Login Page' },
  { path: 'forgotPassword', component: ForgotPasswordPage,  title: 'Forgot Password Page' },
  { path: 'verifyCode',     component: VerifyCodePage,      title: 'Verify Code Page' },
  { path: 'resetPassword',  component: ResetPasswordPage,   title: 'Reset Password Page' },

  // App routes
<<<<<<< HEAD
  { path: 'home',                component: Home,           title: 'Home' },
  { path: 'menu',                component: Menu,           title: 'Menu' },
  { path: 'product/:slug/:id',   component: ProductDetails, title: 'Product Details' },
  { path: 'profile',             component: ProfilePage,    title: 'Profile' },
  { path: 'my-orders-page',      component: MyOrdersPage,   title: 'My Orders' },

  // ✅ Routes مضافة
  { path: 'contact',             component: ContactComponent,  title: 'Contact Us' },
  { path: 'checkout',            component: CheckoutComponent, title: 'Checkout' },
=======
  { path: 'home', component: Home, title: 'Home' },
  { path: 'menu', component: Menu, title: 'Menu' },
  { path: 'product/:slug/:id', component: ProductDetails, title: 'Product Details' },
  { path: 'complaint', component: ContactComponent, title: 'Complaint' },
  { path: 'checkout', component: CheckoutComponent, title: 'Checkout' },
  { path: 'profile', component: ProfilePage, title: 'profile' },
  { path: 'my-orders-page', component: MyOrdersPage, title: 'My Orders' },
>>>>>>> c465d766df47f49b29977f8737751e65aabfc9a7

  // Delivery routes
  { path: 'delivery-home', component: DeliveryHome },

  // Admin routes
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () => import('./admin/admin-module').then((m) => m.AdminModule),
  },

<<<<<<< HEAD
  // ✅ 404 — لازم تكون آخر route دايمًا
=======
>>>>>>> c465d766df47f49b29977f8737751e65aabfc9a7
  { path: '**', component: NotFound, title: 'Page Not Found' },
];