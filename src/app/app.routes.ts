import { Routes, RedirectCommand, CanMatchFn, Router } from '@angular/router';
import { StartSiteComponent } from './components/start-site/start-site.component';
import { SignupComponent } from './components/signup/signup.component';
import { LoginComponent } from './components/login/login.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { MainContentComponent } from './components/main-content/main-content.component';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';

const authGuard: CanMatchFn = (route, segments) => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const isAuthenticated = authService.getUser();
    if (isAuthenticated) {
        return true;
    }
    return new RedirectCommand(router.parseUrl('/start-site'));
};

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'start-site'
    },
    {
        path: 'start-site',
        component: StartSiteComponent
    },
    {
        path: 'main-content',
        component: MainContentComponent,
        canMatch: [authGuard]
    },
    {
        path: 'signup',
        component: SignupComponent
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'forgot-password',
        component: ForgotPasswordComponent
    },
    {
        path: 'reset-password',
        component: ResetPasswordComponent
    },
    {
        path: '**',
        component: NotFoundComponent
    }
];
