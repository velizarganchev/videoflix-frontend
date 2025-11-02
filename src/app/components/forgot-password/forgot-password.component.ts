import { Component, DestroyRef, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { CheckEmailComponent } from "../../shared/check-email/check-email.component";
import { LoadingSpinnerComponent } from "../../shared/loading-spinner/loading-spinner.component";

/**
 * Async email existence validator factory.
 *
 * Creates an async validator that checks whether the provided email exists
 * among the preloaded user emails.
 *
 * **Important:** This function expects that `allEmails` is already loaded.
 *
 * @param allEmails - A list of known user emails to validate against.
 * @returns A validator function that accepts an `AbstractControl` and returns
 * an Observable emitting `null` when the email exists, or `{ emailDontExists: true }` otherwise.
 *
 * @example
 * control.setAsyncValidators(validateEmail(['a@b.com', 'c@d.com']));
 */
function validateEmail(allEmails: string[]) {
  return (control: AbstractControl) => {
    const email = control.value;
    if (allEmails.find((existingEmail) => existingEmail === email)) {
      return of(null);
    } else {
      return of({ emailDontExists: true });
    }
  }
}

/**
 * Forgot password feature component.
 *
 * Renders a form with a single email field and coordinates the "forgot password"
 * flow by:
 * - Loading known user emails to attach an async existence validator.
 * - Submitting the email to request a password reset.
 * - Managing UI state with Angular signals (loading, sent state, selected email).
 *
 * Selector: `app-forgot-password`
 * Standalone: `true`
 * Imports: `ReactiveFormsModule`, `CheckEmailComponent`, `LoadingSpinnerComponent`
 */
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, CheckEmailComponent, LoadingSpinnerComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  /**
   * Authentication service used to load user emails and trigger password reset requests.
   */
  private authService = inject(AuthService);

  /**
   * Angular destroy reference used to register teardown logic (unsubscribe on destroy).
   */
  destroyRef = inject(DestroyRef);

  /**
   * Signals whether a reset email has been successfully sent.
   */
  emailIsSent = signal<boolean>(false);

  /**
   * Holds the email address used for the reset request (for UI feedback).
   */
  email = signal<string>('');

  /**
   * Signals whether the submit action is currently in progress (spinner control).
   */
  isSubmitLoading = signal<boolean>(false);

  /**
   * Reactive form group for the forgot-password flow.
   *
   * Controls:
   * - `email`: required + email format; async existence validator is attached after emails are loaded.
   */
  forgotPasswordForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
    }),
  });

  /**
   * Lifecycle hook.
   *
   * Loads all user emails and sets an async validator on the email control that
   * verifies the email exists. Subscriptions are automatically cleaned up on destroy.
   */
  ngOnInit() {
    const subscription = this.authService.loadUserEmails().subscribe({
      next: () => {
        this.forgotPasswordForm
          .get('email')
          ?.setAsyncValidators(validateEmail(this.authService.allUserEmails()));
      },
      error: (error) => {
        console.error(error);
      }
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  /**
   * Handles form submission for the forgot-password request.
   *
   * Behavior:
   * - Sets loading state.
   * - If form is valid, calls the auth service to send the reset email.
   * - Stores the submitted email in a signal for UI messaging.
   * - Toggles `emailIsSent` to show success state.
   * - Ensures subscription cleanup on destroy.
   */
  onSubmit() {
    this.isSubmitLoading.set(true);
    if (this.forgotPasswordForm.valid) {
      const email = this.forgotPasswordForm.get('email')?.value;
      const subscription = this.authService.forgotPassword(email!).subscribe({
        next: (response) => {
          console.log(response);
          this.email.set(email!);
        },
        error: (error) => {
          console.log(error);
        },
        complete: () => {
          this.isSubmitLoading.set(false);
          this.emailIsSent.set(true);
        }
      });

      this.destroyRef.onDestroy(() => {
        subscription.unsubscribe();
      })
    }
  }
}
