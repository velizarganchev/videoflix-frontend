import { Component, input } from '@angular/core';

@Component({
  selector: 'app-successful-register',
  standalone: true,
  imports: [],
  templateUrl: './successful-register.component.html',
  styleUrl: './successful-register.component.scss'
})
export class SuccessfulRegisterComponent {
  user = input<{ email: string, username: string }>({
    email: '',
    username: '',
  });

  get getFormattedUsername() {
    return this.user().username.charAt(0).toUpperCase() + this.user().username.slice(1)
  }
}
