import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { authInterceptor, routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

/**
 * Global Angular application configuration.
 *
 * This configuration bootstraps essential providers used across the app:
 *
 * - **Routing:** Sets up Angular Router with all application routes
 *   and enables automatic binding of route parameters to component inputs
 *   via `withComponentInputBinding()`.
 *
 * - **HTTP Client:** Registers the Angular HttpClient along with
 *   a global `authInterceptor` for attaching authentication headers
 *   to outgoing HTTP requests.
 *
 * This configuration is imported and used during app bootstrap
 * (in `main.ts`) to initialize global services and routing.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    /**
     * Provides the application routes and enables component input binding
     * from route parameters.
     */
    provideRouter(routes, withComponentInputBinding()),

    /**
     * Provides the Angular HttpClient with authentication interceptor support.
     */
    provideHttpClient(withInterceptors([authInterceptor]))
  ],
};
