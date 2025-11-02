import { afterNextRender, Component, DestroyRef, inject, signal, viewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoadingSpinnerComponent } from "../../shared/loading-spinner/loading-spinner.component";

/**
 * Login component.
 *
 * Handles user authentication, including:
 * - Email/password login form
 * - "Remember Me" functionality (localStorage)
 * - Loading spinner and password visibility toggle
 * - Navigation to main content after successful login
 *
 * Selector: `app-login`
 * Standalone: `true`
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, LoadingSpinnerComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  /**
   * Reference to the login form in the template (`#loginForm`).
   * Used for programmatic control over form fields.
   */
  private form = viewChild.required<NgForm>('loginForm');

  /**
   * Authentication service for handling user login requests.
   */
  authService = inject(AuthService);

  /**
   * Angular DestroyRef for registering cleanup logic (unsubscribe, etc.).
   */
  destroyRef = inject(DestroyRef);

  /**
   * Router instance used for post-login navigation.
   */
  router = inject(Router);

  /**
   * Signal controlling password visibility (true = visible).
   */
  showPassword = signal<boolean>(false);

  /**
   * Signal controlling the loading spinner state.
   */
  isloading = signal<boolean>(false);

  /**
   * "Remember Me" checkbox value. When true, stores credentials in localStorage.
   */
  rememberMe = false;

  /**
   * Data loaded from localStorage if the user previously enabled "Remember Me".
   * Contains `email` and `password` if available.
   */
  rememberMeData = localStorage.getItem('rememberMe') ? JSON.parse(localStorage.getItem('rememberMe')!) : null;

  /**
   * Constructor lifecycle.
   *
   * After the next render, restores remembered credentials (if any)
   * into the login form fields.
   */
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

  /**
   * Toggles password visibility in the form.
   *
   * @param field - The form field name to toggle (expected: `'password'`).
   *
   * @example
   * this.togglePasswordVisibility('password');
   */
  togglePasswordVisibility(field: string) {
    if (field === 'password') {
      this.showPassword.set(!this.showPassword());
    }
  }

  /**
   * Handles login form submission.
   *
   * Behavior:
   * - Validates the form.
   * - Sets the loading spinner.
   * - Calls the authentication service with the provided credentials.
   * - Stores credentials if "Remember Me" is enabled.
   * - Navigates to `/main-content` on success.
   * - Resets form after short delay.
   *
   * All subscriptions are cleaned up on component destroy.
   *
   * @param formData - The `NgForm` instance representing the login form.
   */
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
          this.isloading.set(false);
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
