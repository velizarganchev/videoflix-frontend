import { Component, input } from '@angular/core';

/**
 * Successful Register component.
 *
 * Displays a confirmation message after a user has successfully registered.
 * Shows the new user's email and formatted username for a personalized greeting.
 *
 * Selector: `app-successful-register`
 * Standalone: `true`
 */
@Component({
  selector: 'app-successful-register',
  standalone: true,
  imports: [],
  templateUrl: './successful-register.component.html',
  styleUrl: './successful-register.component.scss'
})
export class SuccessfulRegisterComponent {
  /**
   * Input signal containing the registered user's information.
   * Includes both email and username.
   *
   * @example
   * <app-successful-register [user]="{ email: 'john@example.com', username: 'john' }"></app-successful-register>
   */
  user = input<{ email: string; username: string }>({
    email: '',
    username: '',
  });

  /**
   * Returns the username formatted with an uppercase first letter.
   *
   * @example
   * // If username = 'john'
   * getFormattedUsername → 'John'
   */
  get getFormattedUsername() {
    return this.user().username.charAt(0).toUpperCase() + this.user().username.slice(1);
  }
}
