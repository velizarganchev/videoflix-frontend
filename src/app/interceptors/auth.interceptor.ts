import { inject } from '@angular/core';
import { HttpHandlerFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

const REFRESH_PATH_REGEX = /\/users\/(login|refresh|logout)\/?$/i;

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
    const auth = inject(AuthService);
    const router = inject(Router);

    // ВАЖНО: пращай cookies навсякъде (CORS на бекенда позволява креденшъли)
    const apiReq = req.clone({ withCredentials: true });

    return next(apiReq).pipe(
        catchError((err: unknown) => {
            const isHttp = err instanceof HttpErrorResponse;
            const is401 = isHttp && err.status === 401;

            if (is401 && !apiReq.headers.has('X-Retry') && !REFRESH_PATH_REGEX.test(apiReq.url)) {
                return auth.refresh().pipe(
                    switchMap(() => next(apiReq.clone({ headers: apiReq.headers.set('X-Retry', '1') }))),
                    catchError(() => {
                        router.navigate(['/login'], { replaceUrl: true });
                        return throwError(() => err);
                    })
                );
            }
            return throwError(() => err);
        })
    );
}
