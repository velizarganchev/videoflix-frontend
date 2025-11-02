import {
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  Signal,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { of } from 'rxjs';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { SuccessfulRegisterComponent } from '../../shared/successful-register/successful-register.component';

/**
 * Async email validator factory.
 *
 * Validates whether an email already exists among all registered user emails.
 *
 * @param allEmails$ - A signal providing the list of existing user emails.
 * @returns An async validator function that emits `{ emailExists: true }` if found, or `null` if unique.
 */
function emailValidator(allEmails$: Signal<string[]>) {
  return (control: AbstractControl) => {
    const email = control.value;
    if (allEmails$().find((existingEmail) => existingEmail === email)) {
      return of({ emailExists: true });
    } else {
      return of(null);
    }
  };
}

/**
 * Cross-field validator ensuring two form controls contain equal values.
 *
 * Typically used for password and confirm password fields.
 *
 * @param controlOne - The name of the first control.
 * @param controlTwo - The name of the second control.
 * @returns A validator returning `{ valuesNotEqual: true }` if they differ, or `null` otherwise.
 */
function equalValuesValidator(controlOne: string, controlTwo: string) {
  return (control: AbstractControl) => {
    const valueOne = control.get(controlOne)?.value;
    const valueTwo = control.get(controlTwo)?.value;

    if (valueOne !== valueTwo) {
      return { valuesNotEqual: true };
    } else {
      return null;
    }
  };
}

/**
 * Signup component.
 *
 * Handles new user registration, including:
 * - Reactive signup form with async email validation and password matching
 * - Loading state and success feedback
 * - Password visibility toggling
 * - Automatic prefill of email if provided as input
 *
 * Selector: `app-signup`
 * Standalone: `true`
 */
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    LoadingSpinnerComponent,
    SuccessfulRegisterComponent,
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent implements OnInit {
  /**
   * Authentication service providing signup logic and user data management.
   */
  private authService = inject(AuthService);

  /**
   * Angular DestroyRef used to manage subscription cleanup.
   */
  destroyRef = inject(DestroyRef);

  /**
   * Optional email input, typically used when navigating from other flows (e.g. forgot password).
   */
  email = input<string>('');

  /**
   * Signal controlling loading spinner during signup submission.
   */
  isSingupLoading = signal<boolean>(false);

  /**
   * Signal indicating that the signup process completed successfully.
   */
  successFullSignup = signal<boolean>(false);

  /**
   * Signal controlling password input visibility.
   */
  showPassword = signal<boolean>(false);

  /**
   * Signal controlling confirm-password input visibility.
   */
  showConfirmPassword = signal<boolean>(false);

  /**
   * Stores basic user data for display after successful registration.
   */
  userData = signal<{
    email: string;
    username: string;
  }>({ email: '', username: '' });

  /**
   * Computed signal of all user emails fetched from `AuthService`.
   * Used to dynamically validate new user emails for uniqueness.
   */
  allEmails = computed(() => this.authService.allUserEmails());

  /**
   * Reactive signup form definition.
   *
   * Structure:
   * - `email`: required, valid email format, async uniqueness check.
   * - `passwords`: nested group containing:
   *   - `password`: required, min length 6.
   *   - `confirmPassword`: required, must match password.
   */
  signupForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
      asyncValidators: [emailValidator(this.authService.allUserEmails)],
    }),
    passwords: new FormGroup(
      {
        password: new FormControl('', {
          validators: [Validators.required, Validators.minLength(6)],
        }),
        confirmPassword: new FormControl('', {
          validators: [Validators.required],
        }),
      },
      { validators: [equalValuesValidator('password', 'confirmPassword')] }
    ),
  });

  /**
   * Lifecycle hook.
   *
   * Pre-fills the email field if an input value is provided (e.g. redirected from another page).
   */
  ngOnInit(): void {
    if (this.email()) {
      this.signupForm.get('email')?.setValue(this.email());
    }
  }

  /**
   * Toggles visibility of password or confirm password input fields.
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
   * Handles signup form submission.
   *
   * Behavior:
   * - Validates the form before sending data.
   * - Activates loading spinner while request is in progress.
   * - Sends signup data (`email`, `password`, `confirmPassword`) via `AuthService`.
   * - On success, stores user info and toggles success signal.
   * - On error, resets the form and clears loading state.
   * - Automatically unsubscribes on destroy.
   */
  onSubmit() {
    if (this.signupForm.valid) {
      this.isSingupLoading.set(true);
      const email = this.signupForm.get('email')?.value;
      const password = this.signupForm.get('passwords.password')?.value;
      const confirmPassword = this.signupForm.get(
        'passwords.confirmPassword'
      )?.value;

      const subscription = this.authService
        .signup(email!, password!, confirmPassword!)
        .subscribe({
          next: (user) => {
            console.log('User signed up successfully');
            this.userData.set({
              email: user.email,
              username: user.email.split('@')[0],
            });
          },
          error: (error) => {
            console.error('Error signing up:', error);
            this.isSingupLoading.set(false);
            this.signupForm.reset();
          },
          complete: () => {
            this.isSingupLoading.set(false);
            this.successFullSignup.set(true);
          },
        });

      this.destroyRef.onDestroy(() => {
        subscription.unsubscribe();
      });
    }
  }
}
