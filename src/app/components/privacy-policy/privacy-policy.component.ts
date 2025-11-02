import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';

/**
 * Privacy Policy component.
 *
 * Displays the application's privacy policy page.
 * Provides navigation control to return to the previous page.
 *
 * Selector: `app-privacy-policy`
 * Standalone: `true`
 */
@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent {
  /**
   * Angular Location service used to navigate back in browser history.
   */
  _location = inject(Location);

  /**
   * Navigates one step back in the browser history.
   *
   * @example
   * this.backClicked(); // Returns to the previous route
   */
  backClicked() {
    this._location.back();
  }
}
