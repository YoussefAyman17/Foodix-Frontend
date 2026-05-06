import { Routes } from '@angular/router';
import { RegisterPage } from './Components/register-page/register-page';
import { LoginPage } from './Components/login-page/login-page';
import { ForgotPasswordPage } from './Components/forgot-password-page/forgot-password-page';
import { VerifyCodePage } from './Components/verify-code-page/verify-code-page';
import { ResetPasswordPage } from './Components/reset-password-page/reset-password-page';

export const routes: Routes = [
  { path: 'signUp', component: RegisterPage, title: 'Register Page' },
  { path: 'login', component: LoginPage, title: 'Login page' },
  { path: '', component: LoginPage, title: 'Login page' },
  { path: 'forgotPassword', component: ForgotPasswordPage, title: 'Forgot Password Page' },
  { path: 'verifyCode', component: VerifyCodePage, title: 'Verify Code Page' },
  { path: 'resetPassword', component: ResetPasswordPage, title: 'Reset Password Page' },
];
