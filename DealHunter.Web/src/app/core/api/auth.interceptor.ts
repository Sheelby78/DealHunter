import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const pin = authService.pin();

  let authReq = req;
  if (pin && !req.headers.has('X-PIN')) {
    authReq = req.clone({
      setHeaders: { 'X-PIN': pin }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && authService.isAuthenticated()) {
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
