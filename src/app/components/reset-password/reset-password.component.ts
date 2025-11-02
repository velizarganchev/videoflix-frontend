import { Component, DestroyRef, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingSpinnerComponent } from "../../shared/loading-spinner/loading-spinner.component";

/**
 * Async validator that checks if the two password fields match.
 *
 * Should be attached to the form group rather than individual controls.
 *
 * @returns An async validator function that emits `null` if passwords match,
 * or `{ notEqual: true }` if they differ.
 *
 * @example
 * new FormGroup({...}, { asyncValidators: [equalsToPassword()] });
 */
function equalsToPassword() {
  return (control: AbstractControl) => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password === confirmPassword) {
      return of(null);
    } else {
      return of({ notEqual: true });
    }
  }
}

/**
 * Reset Password component.
 *
 * Handles password reset functionality for users who have received a reset link.
 * Extracts reset tokens from query parameters, validates new passwords,
 * and calls the backend service to finalize password reset.
 *
 * Features:
 * - Reactive form with password validation and matching
 * - Toggle password visibility for both inputs
 * - Submits the new password via `AuthService`
 * - Redirects to login after completion
 *
 * Selector: `app-reset-password`
 * Standalone: `true`
 */
@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  /**
   * Authentication service for handling password reset requests.
   */
  authService = inject(AuthService);

  /**
   * Angular destroy reference (reserved for potential cleanup use).
   */
  destroyRef = inject(DestroyRef);

  /**
   * Router used for navigation after password reset.
   */
  router = inject(Router);

  /**
   * Activated route used to extract `uid` and `token` from the query parameters.
   */
  activatedRoute = inject(ActivatedRoute);

  /**
   * Signal controlling password field visibility.
   */
  showPassword = signal<boolean>(false);

  /**
   * Signal controlling confirm-password field visibility.
   */
  showConfirmPassword = signal<boolean>(false);

  /**
   * Signal holding user ID extracted from the query parameters.
   */
  uid = signal<string>('');

  /**
   * Signal holding password reset token extracted from the query parameters.
   */
  token = signal<string>('');

  /**
   * Indicates whether the password reset form is currently being submitted.
   */
  isResetPasswordFormSubmitted = signal<boolean>(false);

  /**
   * Reactive form for resetting the password.
   *
   * Controls:
   * - `password`: required, minimum length 6
   * - `confirmPassword`: required, minimum length 6
   *
   * Async Validators:
   * - `equalsToPassword`: ensures both fields match
   */
  resetPasswordForm = new FormGroup({
    password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(6)],
    }),
    confirmPassword: new FormControl('', {
      validators: [Validators.required, Validators.minLength(6)],
    }),
  }, { asyncValidators: [equalsToPassword()] });

  /**
   * Lifecycle hook.
   *
   * Extracts `uid` and `token` from the current route’s query parameters
   * to be used in the password reset request.
   */
  ngOnInit() {
    this.uid.set(this.activatedRoute.snapshot.queryParamMap.get('uid')!);
    this.token.set(this.activatedRoute.snapshot.queryParamMap.get('token')!);
  }

  /**
   * Toggles visibility of password or confirm password input field.
   *
   * @param field - Either `'password'` or `'confirmPassword'`.
   *
   * @example
   * this.togglePasswordVisibility('password');
   */
  togglePasswordVisibility(field: string) {
    if (field === 'password') {
      this.showPassword.set(!this.showPassword());
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword.set(!this.showConfirmPassword());
    }
  }

  /**
   * Submits the new password to the authentication service.
   *
   * Behavior:
   * - Validates the form.
   * - Sets submission loading state.
   * - Sends the password reset request with `uid`, `token`, and `new_password`.
   * - On success or error, navigates back to the login page after completion.
   */
  resetPassword() {
    if (this.resetPasswordForm.valid) {
      this.isResetPasswordFormSubmitted.set(true);
      const new_password = this.resetPasswordForm.get('password')?.value;

      this.authService.resetPassword(this.uid(), this.token(), new_password!).subscribe({
        next: (response) => { },
        error: (error) => {
          console.error(error);
          setTimeout(() => {
            this.isResetPasswordFormSubmitted.set(false);
            this.router.navigate(['/login']);
          }, 4000);
        },
        complete: () => {
          this.isResetPasswordFormSubmitted.set(false);
          this.router.navigate(['/login']);
        }
      });
    }
  }
}
