import { Component, inject } from '@angular/core';
import { ErrorService } from '../../services/error.service';

/**
 * Error Toast component.
 *
 * Displays temporary toast notifications for error or success messages.
 * Messages are managed through the global `ErrorService`.
 *
 * Provides a simple UI for showing and dismissing error messages.
 *
 * Selector: `app-error-toast`
 * Standalone: `true`
 */
@Component({
  selector: 'app-error-toast',
  standalone: true,
  imports: [],
  templateUrl: './error-toast.component.html',
  styleUrl: './error-toast.component.scss'
})
export class ErrorToastComponent {
  /**
   * Injected global error service used to access and clear messages.
   */
  errorService = inject(ErrorService);

  /**
   * Closes the toast by clearing all active error and success messages.
   *
   * Typically triggered when the user clicks a close button on the toast.
   *
   * @example
   * <button (click)="closeToast()">✕</button>
   */
  closeToast() {
    this.errorService.clearError();
  }
}
