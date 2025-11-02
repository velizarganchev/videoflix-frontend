import {
  Component,
  computed,
  inject,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * Navigation component.
 *
 * Handles the application's top navigation bar.
 * Provides login/logout functionality, user state awareness, and
 * visual feedback when the user scrolls down the page.
 *
 * Selector: `app-navigation`
 * Standalone: `true`
 */
@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
  host: {
    '(window:scroll)': 'onScroll($event)',
  },
})
export class NavigationComponent {
  /**
   * Injected authentication service for managing user session state.
   */
  authService = inject(AuthService);

  /**
   * Angular Router instance for navigation control.
   */
  router = inject(Router);

  /**
   * Computed signal representing the currently authenticated user.
   * Updates reactively when the authentication state changes.
   */
  user = computed(() => this.authService.currentUser());

  /**
   * Boolean flag indicating whether the page has been scrolled
   * past a certain threshold (used for styling changes).
   */
  isScrolled = false;

  /**
   * Logs the user out of the application and redirects to the login page.
   *
   * @example
   * <button (click)="onLogout()">Logout</button>
   */
  onLogout() {
    this.authService.logout();
  }

  /**
   * Scroll listener that toggles the `isScrolled` state when the user scrolls.
   *
   * @param event - The window scroll event.
   *
   * @example
   * // Triggered automatically via the host listener
   * onScroll(event: Event) {
   *   const currentScrollPos = window.scrollY;
   *   this.isScrolled = currentScrollPos > 50;
   * }
   */
  onScroll(event: Event) {
    const currentScrollPos = window.scrollY;
    this.isScrolled = currentScrollPos > 50;
  }
}
