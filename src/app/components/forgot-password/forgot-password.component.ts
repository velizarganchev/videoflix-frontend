import { Component, DestroyRef, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { CheckEmailComponent } from "../../shared/check-email/check-email.component";
import { LoadingSpinnerComponent } from "../../shared/loading-spinner/loading-spinner.component";

function validateEmail(allEmails: string[]) {
  return (control: AbstractControl) => {
    const email = control.value;
    if (allEmails.find((existingEmail) => existingEmail === email)) {
      return of(null);
    } else {
      return of({ emailDontExists: true });
    }
  }
}
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, CheckEmailComponent, LoadingSpinnerComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);
  destroyRef = inject(DestroyRef);
  emailIsSent = signal<boolean>(false);
  email = signal<string>('');
  isSubmitLoading = signal<boolean>(false);

  forgotPasswordForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
    }),
  });

  ngOnInit() {
    const subscription = this.authService.loadUserEmails().subscribe({
      next: () => {
        this.forgotPasswordForm
          .get('email')
          ?.setAsyncValidators(validateEmail(this.authService.allUserEmails()));
      },
      error: (error) => {
        console.error(error);
      }
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  onSubmit() {
    this.isSubmitLoading.set(true);
    if (this.forgotPasswordForm.valid) {
      const email = this.forgotPasswordForm.get('email')?.value;
      const subscription = this.authService.forgotPassword(email!).subscribe({
        next: (response) => {
          console.log(response);
          this.email.set(email!);
        },
        error: (error) => {
          console.log(error);
        },
        complete: () => {
          this.isSubmitLoading.set(false);
          this.emailIsSent.set(true);
        }
      });

      this.destroyRef.onDestroy(() => {
        subscription.unsubscribe();
      })
    }
  }
}
