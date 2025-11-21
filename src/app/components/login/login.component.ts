import {
  afterNextRender,
  Component,
  DestroyRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, LoadingSpinnerComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  /** Template form reference */
  private form = viewChild.required<NgForm>('loginForm');

  /** Services */
  authService = inject(AuthService);
  router = inject(Router);

  /** Cleanup */
  destroyRef = inject(DestroyRef);

  /** UI state signals */
  showPassword = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  formError = signal<boolean>(false);

  /** Autofill prevention (UI only) */
  rememberMe = false;

  constructor() {
    // Autofocus email field after render
    afterNextRender(() => {
      const emailInput = document.getElementById('email-input');
      emailInput?.focus();
    });
  }

  /** Toggle visibility for password field */
  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  /** Form Submit */
  onSubmit(formData: NgForm) {
    if (!formData.valid) {
      this.triggerErrorShake();
      return;
    }

    this.isLoading.set(true);
    const email = formData.form.value.email;
    const password = formData.form.value.password;

    const sub = this.authService.login(email, password, this.rememberMe).subscribe({
      next: () => {
        this.router.navigate(['/main-content']);
      },
      error: () => {
        this.isLoading.set(false);
        this.triggerErrorShake();
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });

    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  /** Small shake animation */
  private triggerErrorShake() {
    this.formError.set(true);
    setTimeout(() => this.formError.set(false), 400);
  }
}
