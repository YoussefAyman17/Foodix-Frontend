import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const token = localStorage.getItem('userToken');

    if (token) {
      const clonedRequest = req.clone({
        setHeaders: {
          authorization: token,
        },
      });
      return next(clonedRequest);
    }
  }

  return next(req);
};
