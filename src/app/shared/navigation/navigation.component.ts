import { Component, computed, DestroyRef, effect, inject, OnInit } from '@angular/core';
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
  user = computed(
    () => this.authService.currentUser()
  )

  ngOnInit(): void {
    if(this.authService.getUser()){
      this.user = computed(() => this.authService.getUser());
    }
  }

  onLogout() {
    this.authService.logout();
    this.user = computed(() => null);
    this.router.navigate(['/login'], { replaceUrl: true });
  }

}
