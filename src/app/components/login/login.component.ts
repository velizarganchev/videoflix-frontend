import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  password!: string;
  showPassword = false;
  error = false;

  ngOnInit() {
    this.password = 'password';
  }

  togglePasswordVisibility(field: string) {

    if (field === 'password') {
      this.showPassword = !this.showPassword;
    }
  }
}
