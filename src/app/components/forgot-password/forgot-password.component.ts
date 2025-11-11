import { Component, DestroyRef, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { timer, of } from 'rxjs';
import { switchMap, map, first, catchError } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { CheckEmailComponent } from '../../shared/check-email/check-email.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

/**
 * Async validator that ensures the email exists in the system.
 * Debounced to avoid hammering the API while typing.
 *
 * Returns `null` when the email exists (valid),
 * or `{ emailNotFound: true }` when it doesn't.
 */
function emailMustExistValidator(auth: AuthService) {
  return (control: AbstractControl) => {
    const email = String(control.value || '').trim();

    if (!email || control.hasError?.('email')) {
      return of(null);
    }

    return timer(500).pipe(
      switchMap(() => auth.checkEmailExists(email)),
      map(({ exists }) => (exists ? null : { emailNotFound: true })),
      catchError(() => of(null)),
      first()
    );
  };
}

/**
 * Forgot password feature component.
 *
 * Renders a single-field form (email) that:
 * - Validates email format and existence (async, debounced).
 * - Calls AuthService.forgotPassword on submit.
 * - Exposes UI state with signals: loading + sent + echoed email.
 */
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, CheckEmailComponent, LoadingSpinnerComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  /** Auth service used for async validation and submit. */
  private readonly auth = inject(AuthService);

  /** DestroyRef to clean up pending subscriptions created on submit. */
  private readonly destroyRef = inject(DestroyRef);

  /** UI state signals */
  emailIsSent = signal<boolean>(false);
  email = signal<string>('');
  isSubmitLoading = signal<boolean>(false);

  /** Reactive form: single email control with sync + async validators. */
  forgotPasswordForm = new FormGroup({
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
      asyncValidators: [emailMustExistValidator(this.auth)],
      updateOn: 'change',
    }),
  });

  /**
   * Submit handler:
   * - Guards by form validity.
   * - Shows spinner.
   * - Calls backend to send the reset email.
   * - On success, stores the email for UI and toggles `emailIsSent`.
   */
  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    const email = this.forgotPasswordForm.get('email')!.value!;
    this.isSubmitLoading.set(true);

    const sub = this.auth.forgotPassword(email).subscribe({
      next: () => {
        this.email.set(email);
      },
      error: (err) => {
        // Optional: тук можеш да ползваш централен ErrorService, ако искаш UI нотификация.
        console.error('Forgot password failed:', err);
        this.isSubmitLoading.set(false);
      },
      complete: () => {
        this.isSubmitLoading.set(false);
        this.emailIsSent.set(true);
      },
    });

    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }
}
