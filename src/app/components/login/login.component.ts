import { afterNextRender, Component, DestroyRef, inject, signal, viewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoadingSpinnerComponent } from "../../shared/loading-spinner/loading-spinner.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, LoadingSpinnerComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private form = viewChild.required<NgForm>('loginForm');

  authService = inject(AuthService);
  destroyRef = inject(DestroyRef);
  router = inject(Router);

  showPassword = signal<boolean>(false);
  isloading = signal<boolean>(false);
  rememberMe = false;
  rememberMeData = localStorage.getItem('rememberMe') ? JSON.parse(localStorage.getItem('rememberMe')!) : null;

  constructor() {
    afterNextRender(() => {
      if (this.rememberMeData) {
        setTimeout(() => {
          this.form().controls['email'].setValue(this.rememberMeData.email);
          this.form().controls['password'].setValue(this.rememberMeData.password);
        }, 1);
      }
    });
  }

  togglePasswordVisibility(field: string) {

    if (field === 'password') {
      this.showPassword.set(!this.showPassword());
    }
  }

  onSubmit(formData: NgForm) {
    if (formData.form.valid) {
      this.isloading.set(true);

      const rememberMe = this.rememberMe;
      const email = formData.form.value.email;
      const password = formData.form.value.password;

      const subscription = this.authService.login(formData.form.value.email, formData.form.value.password).subscribe({
        next: (user) => {
          this.router.navigate(['/main-content']);
          if (rememberMe) {
            localStorage.setItem('rememberMe', JSON.stringify({
              email: email,
              password: password
            }));
          }
        },
        error: (error) => {
          console.error('Error logging in:', error);
        },
        complete: () => {
          this.isloading.set(false);
        }
      });

      this.destroyRef.onDestroy(() => {
        subscription.unsubscribe();
      });
      setTimeout(() => {
        formData.form.reset();
      }, 1000);
    }
  }
}
