import { Injectable, signal } from '@angular/core';

/**
 * Error handling service.
 *
 * Provides a simple reactive interface for displaying and clearing
 * temporary error and success messages across the application.
 *
 * Messages are automatically cleared after a short timeout.
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  /**
   * Internal signal for managing error messages.
   */
  private _error = signal('');

  /**
   * Internal signal for managing success messages.
   */
  private _success = signal('');

  /**
   * Readonly signal exposing the current error message.
   * Components can subscribe to this for reactive updates.
   */
  error = this._error.asReadonly();

  /**
   * Displays an error message to the user.
   *
   * Automatically clears the message after 3 seconds.
   *
   * @param message - The error message to display.
   *
   * @example
   * this.errorService.showError('Invalid credentials');
   */
  showError(message: string) {
    this._error.set(message);
    setTimeout(() => {
      this.clearError();
    }, 3000);
  }

  /**
   * Displays a success message to the user.
   *
   * Automatically clears both success and error messages after 3 seconds.
   *
   * @param message - The success message to display.
   *
   * @example
   * this.errorService.showSuccess('Profile updated successfully');
   */
  showSuccess(message: string) {
    this._success.set(message);
    setTimeout(() => {
      this.clearError();
    }, 3000);
  }

  /**
   * Clears all error and success messages immediately.
   *
   * Useful for manual resets or before navigation.
   */
  clearError() {
    this._error.set('');
    this._success.set('');
  }
}
