import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Routes, RedirectCommand, CanMatchFn, Router } from '@angular/router';
import { StartSiteComponent } from './components/start-site/start-site.component';
import { SignupComponent } from './components/signup/signup.component';
import { LoginComponent } from './components/login/login.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { MainContentComponent } from './components/main-content/main-content.component';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { PlaygroundComponent } from './components/playground/playground.component';
import { ImprintComponent } from './components/imprint/imprint.component';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';

/**
 * Authentication guard for main content routes.
 *
 * Restricts access to authenticated users only.
 * If the user is not authenticated, they are redirected to the start page.
 *
 * @param route - Current route.
 * @param segments - Current route segments.
 * @returns `true` if authenticated, otherwise a redirect command.
 */
const authGuardMainContent: CanMatchFn = (route, segments) => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const isAuthenticated = authService.isAuthenticated();
    if (isAuthenticated) {
        return true;
    }
    return new RedirectCommand(router.parseUrl('/start-site'));
};

/**
 * Authentication guard for public routes.
 *
 * Restricts access to non-authenticated users (e.g., login, signup).
 * Redirects authenticated users to the main content route.
 *
 * @param route - Current route.
 * @param segments - Current route segments.
 * @returns `true` if unauthenticated, otherwise a redirect command.
 */
const authGuard: CanMatchFn = (route, segments) => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const isAuthenticated = authService.isAuthenticated();
    if (!isAuthenticated) {
        return true;
    }
    return new RedirectCommand(router.parseUrl('/main-content'));
};

/**
 * Application route configuration.
 *
 * Defines all available navigation paths and their associated components.
 * Includes route guards for authentication flow and a wildcard route for 404 handling.
 *
 * @example
 * { path: 'login', component: LoginComponent, canMatch: [authGuard] }
 */
export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'start-site' },
    { path: 'start-site', component: StartSiteComponent, canMatch: [authGuard] },
    { path: 'main-content', component: MainContentComponent, canMatch: [authGuardMainContent] },
    { path: 'signup', component: SignupComponent, canMatch: [authGuard] },
    { path: 'login', component: LoginComponent, canMatch: [authGuard] },
    { path: 'forgot-password', component: ForgotPasswordComponent, canMatch: [authGuard] },
    { path: 'reset-password', component: ResetPasswordComponent, canMatch: [authGuard] },
    { path: 'imprint', component: ImprintComponent },
    { path: 'privacy-policy', component: PrivacyPolicyComponent },
    { path: '**', component: NotFoundComponent },
];
