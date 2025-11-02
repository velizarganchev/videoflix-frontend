import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Not Found component (404 page).
 *
 * Displays a user-friendly error page when a route does not exist.
 * Typically includes navigation options back to the home or login page.
 *
 * Selector: `app-not-found`
 * Standalone: `true`
 */
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent { }
