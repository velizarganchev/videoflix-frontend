import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Footer component.
 *
 * Displays the application's footer section with navigation links,
 * such as privacy policy, imprint, or contact information.
 *
 * Typically rendered globally at the bottom of every page.
 *
 * Selector: `app-footer`
 * Standalone: `true`
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent { }
