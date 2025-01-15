import { Component, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { of } from 'rxjs';

function emailValidator(allEmails: string[]) {
  return (control: AbstractControl) => {
    const email = control.value;

    if (allEmails.find((existingEmail) => existingEmail === email)) {
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
  imports: [ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})

export class SignupComponent implements OnInit {
  authService = inject(AuthService);

  showPassword = false;
  showConfirmPassword = false;
  allEmails = this.authService.allUserEmails;

  signupForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
      asyncValidators: [emailValidator(this.allEmails())],
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



  ngOnInit(): void {
    this.authService.loadUserEmails().subscribe();
  }

  togglePasswordVisibility(field: string) {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  onSubmit() {
    console.log(this.signupForm.value);
  }
}
