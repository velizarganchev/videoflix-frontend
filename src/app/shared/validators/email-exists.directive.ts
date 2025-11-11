import { Directive, inject, input } from '@angular/core';
import {
  AbstractControl,
  AsyncValidator,
  NG_ASYNC_VALIDATORS,
  ValidationErrors,
} from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { catchError, first, map, switchMap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

/**
 * Async email existence validator with debounce.
 * Default: valid if the email EXISTS.
 * Invert mode (for Signup): valid only if the email does NOT exist -> [appEmailExists]="true".
 */
@Directive({
  selector: '[appEmailExists]',
  standalone: true,
  providers: [
    { provide: NG_ASYNC_VALIDATORS, useExisting: EmailExistsValidatorDirective, multi: true },
  ],
})
export class EmailExistsValidatorDirective implements AsyncValidator {
  private readonly auth = inject(AuthService);

  /** When true → valid iff email does NOT exist (for Signup). */
  invert = input<boolean>(false, { alias: 'appEmailExists' });

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    const emailRaw = String(control.value ?? '').trim();
    if (!emailRaw) return of(null);

    return timer(500).pipe(
      switchMap(() => this.auth.checkEmailExists(emailRaw)),
      map(({ exists }) => {
        const ok = this.invert() ? !exists : exists;
        return ok ? null : { emailExists: exists };
      }),
      catchError(() => of(null)),
      first()
    );
  }
}
