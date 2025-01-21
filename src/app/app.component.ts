import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ErrorService } from './services/error.service';
import { ErrorToastComponent } from "./shared/error-toast/error-toast.component";
import { NavigationComponent } from "./shared/navigation/navigation.component";
import { FooterComponent } from "./shared/footer/footer.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ErrorToastComponent,
    NavigationComponent,
    FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'videoflix-frontend';
  public errorServise = inject(ErrorService);
}
