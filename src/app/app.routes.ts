import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Routes, RedirectCommand, CanMatchFn, Router } from '@angular/router';
import { StartSiteComponent } from './components/start-site/start-site.component';
import { SignupComponent } from './components/signup/signup.component';
import { LoginComponent } from './components/login/login.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { MainContentComponent } from './components/main-content/main-content.component';
import { NotFoundComponent } from './shared/not-found/not-found.component';


export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
    if (req.url.includes('/content')) {
        const authToken = inject(AuthService).getUserToken();
        const clonedRequest = req.clone({
            headers: req.headers.append('Authorization', `Token ${authToken}`),
        });
        return next(clonedRequest);
    }
    return next(req);
}

const authGuardMainContent: CanMatchFn = (route, segments) => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const isAuthenticated = authService.getUser();
    if (isAuthenticated) {
        return true;
    }
    return new RedirectCommand(router.parseUrl('/start-site'));
};

const authGuard: CanMatchFn = (route, segments) => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const isAuthenticated = authService.getUser();
    if (!isAuthenticated) {
        return true;
    }
    return new RedirectCommand(router.parseUrl('/main-content'));
};

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'start-site'
    },
    {
        path: 'start-site',
        component: StartSiteComponent,
        canMatch: [authGuard]
    },
    {
        path: 'main-content',
        component: MainContentComponent,
        canMatch: [authGuardMainContent]
    },
    {
        path: 'signup',
        component: SignupComponent,
        canMatch: [authGuard]
    },
    {
        path: 'login',
        component: LoginComponent,
        canMatch: [authGuard]
    },
    {
        path: 'forgot-password',
        component: ForgotPasswordComponent,
        canMatch: [authGuard]
    },
    {
        path: 'reset-password',
        component: ResetPasswordComponent,
        canMatch: [authGuard]
    },
    {
        path: '**',
        component: NotFoundComponent
    }
];
