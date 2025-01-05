import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { StartSiteComponent } from './components/start-site/start-site.component';
import { SignupComponent } from './components/signup/signup.component';
import { LoginComponent } from './components/login/login.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { MainContentComponent } from './components/main-content/main-content.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: HomeComponent
    },
    {
        path: '',
        component: HomeComponent,
        children: [
            {
                path: 'start-site',
                component: StartSiteComponent
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
                path: 'main-content',
                component: MainContentComponent
            }
        ]
    }
];
