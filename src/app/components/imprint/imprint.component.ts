import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';

/**
 * Imprint component.
 *
 * Displays the legal information (imprint) page of the application.
 * Provides a simple navigation method to return to the previous page.
 *
 * Selector: `app-imprint`
 * Standalone: `true`
 */
@Component({
  selector: 'app-imprint',
  standalone: true,
  imports: [],
  templateUrl: './imprint.component.html',
  styleUrl: './imprint.component.scss'
})
export class ImprintComponent {
  /**
   * Angular Location service used to navigate back in browser history.
   */
  _location = inject(Location);

  /**
   * Navigates back to the previous page in browser history.
   *
   * @example
   * this.backClicked(); // Goes one step back in the browser
   */
  backClicked() {
    this._location.back();
  }
}
