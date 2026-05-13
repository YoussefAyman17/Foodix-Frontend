import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common'; // 🌟
import { ToastrService } from 'ngx-toastr';
import { Auth } from '../../core/services/auth';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);
  const toastr = inject(ToastrService);
  const platformId = inject(PLATFORM_ID); // 🌟

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  authService.userData();

  if (authService.isAdmin()) {
    return true;
  }

  toastr.error('Access Denied! You must be an admin to view this page.', 'Unauthorized');
  router.navigate(['/home']);
  return false;
};
