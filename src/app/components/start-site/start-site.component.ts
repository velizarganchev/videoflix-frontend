import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-start-site',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './start-site.component.html',
  styleUrl: './start-site.component.scss'
})
export class StartSiteComponent {
  email = signal<string>('');
}
