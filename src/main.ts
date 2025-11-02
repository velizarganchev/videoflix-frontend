import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

/**
 * Application bootstrap entry point.
 *
 * Initializes the Angular application by bootstrapping the root `AppComponent`
 * with the global configuration defined in `app.config.ts`.
 *
 * Uses Angular's modern standalone component architecture — no `AppModule` required.
 *
 * If an error occurs during initialization, it is logged to the console.
 *
 * @example
 * bootstrapApplication(AppComponent, appConfig)
 *   .catch((err) => console.error(err));
 */
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
