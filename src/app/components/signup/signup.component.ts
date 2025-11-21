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

/** Ensures two fields match */
function equalValuesValidator(controlOne: string, controlTwo: string) {
  return (control: AbstractControl) => {
    const v1 = control.get(controlOne)?.value;
    const v2 = control.get(controlTwo)?.value;
    return v1 === v2 ? null : { valuesNotEqual: true };
  };
}

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
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  email = input<string>('');

  isSingupLoading = signal(false);
  successFullSignup = signal(false);

  showPassword = signal(false);
  showConfirmPassword = signal(false);

  userEmail = signal<{ email: string }>({ email: '' });

  /** Signup form */
  signupForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
      asyncValidators: [this.emailDoesNotExistValidator()],
      updateOn: 'blur',   // important optimization!
    }),
    passwords: new FormGroup(
      {
        password: new FormControl('', [
          Validators.required,
          Validators.minLength(6),
        ]),
        confirmPassword: new FormControl('', Validators.required),
      },
      { validators: [equalValuesValidator('password', 'confirmPassword')] }
    ),
  });

  /** Async validator: checks if the email already exists */
  private emailDoesNotExistValidator() {
    return (control: AbstractControl) => {
      const value = String(control.value ?? '').trim();
      if (!value) return of(null);
      return this.authService.checkEmailExists(value).pipe(
        map(({ exists }) => (exists ? { emailExists: true } : null))
      );
    };
  }

  ngOnInit(): void {
    if (this.email()) {
      this.signupForm.get('email')?.setValue(this.email());
    }
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.showPassword.update((v) => !v);
    } else {
      this.showConfirmPassword.update((v) => !v);
    }
  }

  /** Submit signup data to the backend */
  onSubmit() {
    if (!this.signupForm.valid) return;

    this.isSingupLoading.set(true);

    const email = this.signupForm.get('email')?.value!;
    const password = this.signupForm.get('passwords.password')?.value!;
    const confirmPassword =
      this.signupForm.get('passwords.confirmPassword')?.value!;

    const sub = this.authService
      .signup(email, password, confirmPassword)
      .subscribe({
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
