import { animate, style, transition, trigger } from '@angular/animations';
import { Component, input } from '@angular/core';

/**
 * Check Email component.
 *
 * Displays a confirmation message or visual feedback after a password reset
 * or signup email has been sent to the user.
 *
 * Includes a simple fade-in animation for a smooth visual appearance.
 *
 * Selector: `app-check-email`
 * Standalone: `true`
 */
@Component({
  selector: 'app-check-email',
  standalone: true,
  imports: [],
  templateUrl: './check-email.component.html',
  styleUrl: './check-email.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.5s ease-in', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class CheckEmailComponent {
  /**
   * Input email address to display in the confirmation message.
   *
   * Typically passed from a parent component after successful submission
   * of a password reset or registration form.
   */
  email = input<string>();
}
