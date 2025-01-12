import { Component, inject, OnInit } from '@angular/core';
import { NavigationComponent } from "./navigation/navigation.component";
import { Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from "./footer/footer.component";
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavigationComponent, RouterOutlet, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);

  ngOnInit(): void {
    this.authService.autoLogin();
    if (!this.authService.currentUser()) {
      this.router.navigate(['/login']);
    }
  }
}
