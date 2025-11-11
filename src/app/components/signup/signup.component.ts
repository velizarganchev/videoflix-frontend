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

  private authService = inject(AuthService);

  destroyRef = inject(DestroyRef);

  email = input<string>('');

  isSingupLoading = signal<boolean>(false);

  successFullSignup = signal<boolean>(false);

  showPassword = signal<boolean>(false);

  showConfirmPassword = signal<boolean>(false);


  userEmail = signal<{
    email: string;
  }>({ email: '' });


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

  private emailDoesNotExistValidator() {
    return (control: AbstractControl) => {
      const email = String(control.value ?? '').trim();
      if (!email) return of(null);
      return this.authService.checkEmailExists(email).pipe(
        map(({ exists }) => {
          return exists ? { emailExists: true } : null;
        })
      );
    };
  }

  ngOnInit(): void {
    if (this.email()) {
      this.signupForm.get('email')?.setValue(this.email());
    }
  }

  togglePasswordVisibility(field: string) {
    if (field === 'password') {
      this.showPassword.set(!this.showPassword());
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword.set(!this.showConfirmPassword());
    }
  }

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
