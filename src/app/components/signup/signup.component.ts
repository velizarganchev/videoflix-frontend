import { Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';


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
export class SignupComponent {
  signupForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    passwords: new FormGroup(
      {
        password: new FormControl('', [
          Validators.required,
          Validators.minLength(6),
        ]),
        confirmPassword: new FormControl('', [Validators.required]),
      },
      { validators: [equalValuesValidator('password', 'confirmPassword')] }
    ),
  });

  showPassword = false;
  showConfirmPassword = false;

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
