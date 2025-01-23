import { Component, computed, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.class';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent {

  authService = inject(AuthService);
  router = inject(Router);
  user = computed(() => this.authService.currentUser());

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

}
