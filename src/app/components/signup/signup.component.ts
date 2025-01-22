import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  Signal,
  signal
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
import { LoadingSpinnerComponent } from "../../shared/loading-spinner/loading-spinner.component";
import { SuccessfulRegisterComponent } from "../../shared/successful-register/successful-register.component";

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

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, LoadingSpinnerComponent, SuccessfulRegisterComponent],
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

  userData = signal<{
    email: string;
    username: string;
  }>({ email: '', username: '' });

  allEmails = computed(() => this.authService.allUserEmails());

  signupForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
      asyncValidators: [emailValidator(this.authService.allUserEmails)],
    }),
    passwords: new FormGroup(
      {
        password: new FormControl('',
          {
            validators: [
              Validators.required,
              Validators.minLength(6),
            ]
          }
        ),
        confirmPassword: new FormControl('', { validators: [Validators.required] }),
      },
      { validators: [equalValuesValidator('password', 'confirmPassword')] }
    ),
  });

  constructor() {
    afterNextRender(() => {
      if (this.email()) {
        setTimeout(() => {
          this.signupForm.get('email')?.setValue(this.email());
        }, 1);
      }
    });
  }

  ngOnInit(): void {
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
      const email = this.signupForm.get('email')?.value;
      const password = this.signupForm.get('passwords.password')?.value;
      const confirmPassword = this.signupForm.get('passwords.confirmPassword')?.value;

      const subscription = this.authService.signup(email!, password!, confirmPassword!).subscribe({
        next: (user) => {
          console.log('User signed up successfully');
          this.userData.set({
            email: user.email,
            username: user.email.split('@')[0],
          });
        },
        error: (error) => {
          console.error('Error signing up:', error);
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
