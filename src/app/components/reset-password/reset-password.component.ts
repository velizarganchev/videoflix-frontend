import { Component, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { of } from 'rxjs';

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

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {

  showPassword = signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);

  resetPasswordForm = new FormGroup({
    password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(6)],
    }),
    confirmPassword: new FormControl('', {
      validators: [Validators.required, Validators.minLength(6)],
    }),
  }, { asyncValidators: [equalsToPassword()] });

  ngOnInit() {
  }

  togglePasswordVisibility(field: string) {
    if (field === 'password') {
      this.showPassword.set(!this.showPassword());
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword.set(!this.showConfirmPassword());
    }
  }

  resetPassword() {
    if (this.resetPasswordForm.valid) {
      const password = this.resetPasswordForm.get('password')?.value;
      const confirmPassword = this.resetPasswordForm.get('confirmPassword')?.value;
      console.log('Password reset successfully');
      console.log(this.resetPasswordForm);
      
      console.log('Password:', password);
      console.log('ConfirmPassword:', confirmPassword);
    }
  }
}
