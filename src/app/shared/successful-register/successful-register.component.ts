import { Component, computed, input } from '@angular/core';

/**
 * Successful Register component.
 *
 * Displays a confirmation message after successful registration.
 * Shows the user's email and derives a username from it.
 */
@Component({
  selector: 'app-successful-register',
  standalone: true,
  imports: [],
  templateUrl: './successful-register.component.html',
  styleUrl: './successful-register.component.scss',
})
export class SuccessfulRegisterComponent {

  /**
   * Input signal: contains only the user's email.
   */
  email = input<string>('');

  /**
   * Derived username:
   * Takes everything before @ and capitalizes the first letter.
   *
   * Example:
   *   email = "velizar@example.com"
   *   → Username = "Velizar"
   */
  username = computed(() => {
    const value = this.email().trim();
    if (!value.includes('@')) return '';
    const raw = value.split('@')[0];
    if (!raw) return '';
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  });
}
