import { inject } from '@angular/core';
import { HttpHandlerFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

const REFRESH_PATH_REGEX = /\/users\/(login|refresh|logout)\/?$/i;

const PUBLIC_AUTH_PATHS = [
    '/users/login/',
    '/users/register/',
    '/users/email-exists/',
    '/users/forgot-password/',
    '/users/reset-password/',
];

/**
 * Check if a given URL targets a public auth endpoint (no refresh/redirect).
 */
function isPublicAuthRequest(url: string): boolean {
    return PUBLIC_AUTH_PATHS.some(path => url.includes(path));
}

/**
 * Global HTTP auth interceptor.
 *
 * - Always sends credentials (cookies) with each request.
 * - On 401 responses (except login/refresh/logout + public auth endpoints):
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

            const isRefreshLike = REFRESH_PATH_REGEX.test(apiReq.url);
            const isPublicAuth = isPublicAuthRequest(apiReq.url);
            const alreadyRetried = apiReq.headers.has('X-Retry');

            if (is401 && !alreadyRetried && !isRefreshLike && !isPublicAuth) {
                return auth.refresh().pipe(
                    switchMap(() =>
                        next(apiReq.clone({ headers: apiReq.headers.set('X-Retry', '1') }))
                    ),
                    catchError(() => {
                        auth.clientLogout();
                        router.navigate(['/login'], { replaceUrl: true });
                        return throwError(() => err);
                    })
                );
            }
            return throwError(() => err);
        })
    );
}
