import { Component, DestroyRef, effect, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent implements OnInit {

  authService = inject(AuthService);
  router = inject(Router);

  ngOnInit(): void {    
    
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}
