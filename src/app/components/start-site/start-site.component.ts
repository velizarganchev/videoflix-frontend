import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EmailExistsValidatorDirective } from "../../shared/validators/email-exists.directive";

/**
 * Start Site component.
 *
 * Represents the application's landing or entry page.
 * Typically contains an email input or navigation links to signup/login routes.
 *
 * Selector: `app-start-site`
 * Standalone: `true`
 */
@Component({
  selector: 'app-start-site',
  standalone: true,
  imports: [RouterLink, FormsModule, EmailExistsValidatorDirective],
  templateUrl: './start-site.component.html',
  styleUrl: './start-site.component.scss'
})
export class StartSiteComponent {
  /**
   * Reactive signal holding the user's input email.
   * May be used for pre-filling forms or routing to signup/login pages.
   */
  email = signal<string>('');
}
