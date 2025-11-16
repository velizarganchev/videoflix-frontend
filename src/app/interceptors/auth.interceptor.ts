import { inject } from '@angular/core';
import { HttpHandlerFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

const REFRESH_PATH_REGEX = /\/users\/(login|refresh|logout)\/?$/i;

/**
 * Global HTTP auth interceptor.
 *
 * - Always sends credentials (cookies) with each request.
 * - On 401 responses (except login/refresh/logout):
 *    1) Calls /users/refresh/ to get a new access token.
 *    2) Retries the original request once, marked with "X-Retry".
 * - If refresh fails:
 *    - Clears local auth state via AuthService.clientLogout().
 *    - Redirects the user to the login page.
 */
export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
    const auth = inject(AuthService);
    const router = inject(Router);

    // Always include cookies for backend auth (CSRF / access / refresh)
    const apiReq = req.clone({ withCredentials: true });

    return next(apiReq).pipe(
        catchError((err: unknown) => {
            const isHttp = err instanceof HttpErrorResponse;
            const is401 = isHttp && err.status === 401;

            // Try to refresh token only once and avoid refresh/login/logout endpoints
            if (is401 && !apiReq.headers.has('X-Retry') && !REFRESH_PATH_REGEX.test(apiReq.url)) {
                return auth.refresh().pipe(
                    // On successful refresh → retry original request with X-Retry header
                    switchMap(() =>
                        next(apiReq.clone({ headers: apiReq.headers.set('X-Retry', '1') }))
                    ),
                    // If refresh fails → hard logout and redirect to login
                    catchError(() => {
                        auth.clientLogout();
                        router.navigate(['/login'], { replaceUrl: true });
                        return throwError(() => err);
                    })
                );
            }

            // Propagate all other errors unchanged
            return throwError(() => err);
        })
    );
}
