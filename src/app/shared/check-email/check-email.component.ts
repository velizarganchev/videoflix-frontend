import { animate, style, transition, trigger } from '@angular/animations';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-check-email',
  standalone: true,
  imports: [],
  templateUrl: './check-email.component.html',
  styleUrl: './check-email.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.5s ease-in', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class CheckEmailComponent {
  email = input<string>();
}
