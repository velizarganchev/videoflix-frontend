import {
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
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
import { map, of } from 'rxjs';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { SuccessfulRegisterComponent } from '../../shared/successful-register/successful-register.component';

/**
 * Cross-field validator to ensure two controls have equal values.
 *
 * @param controlOne - Name of the first control.
 * @param controlTwo - Name of the second control.
 * @returns A validator function returning { valuesNotEqual: true } if mismatch.
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
 * SignupComponent
 *
 * Handles new user registration:
 * - Reactive signup form with async email validation and password matching
 * - Loading state and success feedback
 * - Password visibility toggling
 * - Optional prefill of email via @Input
 *
 * Selector: app-signup
 * Standalone: true
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
  /** Auth API wrapper. */
  private authService = inject(AuthService);

  /** Used to clean up subscriptions when the component is destroyed. */
  destroyRef = inject(DestroyRef);

  /**
   * Optional email passed from parent.
   * When present, pre-fills the email field on init.
   */
  email = input<string>('');

  /** Global loading flag for signup submission. */
  isSingupLoading = signal<boolean>(false);

  /** Indicates that signup finished successfully. */
  successFullSignup = signal<boolean>(false);

  /** Toggles visibility of the password field. */
  showPassword = signal<boolean>(false);

  /** Toggles visibility of the confirmPassword field. */
  showConfirmPassword = signal<boolean>(false);

  /** Stores the registered email for success message display. */
  userEmail = signal<{ email: string }>({ email: '' });

  /**
   * Signup form:
   * - email: required + email format + async "emailDoesNotExist" validator
   * - passwords: nested group with password/confirmPassword and match validator
   */
  signupForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
      asyncValidators: [this.emailDoesNotExistValidator()],
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
   * Async validator to ensure the email is not already registered.
   */
  private emailDoesNotExistValidator() {
    return (control: AbstractControl) => {
      const email = String(control.value ?? '').trim();
      if (!email) return of(null);

      return this.authService.checkEmailExists(email).pipe(
        map(({ exists }) => (exists ? { emailExists: true } : null))
      );
    };
  }

  /**
   * On init:
   * - prefill email field if @Input email is provided.
   */
  ngOnInit(): void {
    if (this.email()) {
      this.signupForm.get('email')?.setValue(this.email());
    }
  }

  /**
   * Toggle visibility state for the password or confirmPassword field.
   *
   * @param field - 'password' | 'confirmPassword'
   */
  togglePasswordVisibility(field: string) {
    if (field === 'password') {
      this.showPassword.set(!this.showPassword());
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword.set(!this.showConfirmPassword());
    }
  }

  /**
   * Form submit handler:
   * - Checks validity
   * - Calls AuthService.signup()
   * - Shows loading state and success feedback
   * - Resets form on error
   */
  onSubmit() {
    if (this.signupForm.valid) {
      this.isSingupLoading.set(true);

      const email = this.signupForm.get('email')?.value!;
      const password = this.signupForm.get('passwords.password')?.value!;
      const confirmPassword = this.signupForm.get('passwords.confirmPassword')?.value!;

      const sub = this.authService.signup(email, password, confirmPassword).subscribe({
        next: () => {
          this.userEmail.set({ email });
        },
        error: (err) => {
          console.error('Error signing up:', err);
          this.isSingupLoading.set(false);
          this.signupForm.reset();
        },
        complete: () => {
          this.isSingupLoading.set(false);
          this.successFullSignup.set(true);
        },
      });

      this.destroyRef.onDestroy(() => sub.unsubscribe());
    }
  }
}
