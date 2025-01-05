import { Component } from '@angular/core';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  password!: string;

  showPassword = false;
  showConfirmPassword = false;
  error = false;


  ngOnInit() {
    this.password = 'password';
  }

  togglePasswordVisibility(field: string) {

    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }
}
