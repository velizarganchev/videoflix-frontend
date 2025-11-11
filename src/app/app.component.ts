import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ErrorService } from './services/error.service';
import { ErrorToastComponent } from "./shared/error-toast/error-toast.component";
import { NavigationComponent } from "./shared/navigation/navigation.component";
import { FooterComponent } from "./shared/footer/footer.component";

/**
 * Root application component.
 *
 * Acts as the entry point of the Angular application.
 * Provides global layout elements such as navigation, footer,
 * and error toasts, and initializes authentication data on startup.
 *
 * Responsibilities:
 * - Bootstraps the global app layout.
 * - Loads user email data via `AuthService` at initialization.
 * - Provides reactive error handling through `ErrorService`.
 *
 * Selector: `app-root`
 * Standalone: `true`
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ErrorToastComponent,
    NavigationComponent,
    FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  /**
   * DestroyRef used to clean up subscriptions when the component is destroyed.
   */
  destroyRef = inject(DestroyRef);

  /**
   * Application title, displayed in the main layout or document title.
   */
  title = 'videoflix-frontend';

  /**
   * Injected global error service providing access to app-wide error messages.
   */
  public errorService = inject(ErrorService);
}
