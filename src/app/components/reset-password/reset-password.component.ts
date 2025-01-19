import { Component, DestroyRef, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingSpinnerComponent } from "../../shared/loading-spinner/loading-spinner.component";

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
  imports: [ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  authService = inject(AuthService);
  destroyRef = inject(DestroyRef);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);

  showPassword = signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);
  uid = signal<string>('');
  token = signal<string>('');
  isResetPasswordFormSubmitted = signal<boolean>(false);

  resetPasswordForm = new FormGroup({
    password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(6)],
    }),
    confirmPassword: new FormControl('', {
      validators: [Validators.required, Validators.minLength(6)],
    }),
  }, { asyncValidators: [equalsToPassword()] });

  ngOnInit() {
    this.uid.set(this.activatedRoute.snapshot.queryParamMap.get('uid')!);
    this.token.set(this.activatedRoute.snapshot.queryParamMap.get('token')!);
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
      this.isResetPasswordFormSubmitted.set(true);
      const new_password = this.resetPasswordForm.get('password')?.value;

      this.authService.resetPassword(this.uid(), this.token(), new_password!).subscribe({
        next: (response) => {
          console.log(response);
        },
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
