import { Component, computed, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.class';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
  host: {
    '(window:scroll)': 'onScroll($event)',
  }
})
export class NavigationComponent {

  authService = inject(AuthService);
  router = inject(Router);
  user = computed(() => this.authService.currentUser());
  isScrolled = false;
  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  onScroll(event: Event) {
    const currentScrollPos = window.scrollY;
    this.isScrolled = currentScrollPos > 50;
  }

}
