import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { User } from '../models/user.class';
import { ErrorService } from './error.service';
import { catchError, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';

const BASE_URL = 'https://api.videoflix-velizar-ganchev-backend.com/users';

/**
 * Authentication service.
 *
 * Manages all authentication and user-related operations such as:
 * - Login / Signup / Logout
 * - Password reset flows
 * - Fetching and storing user profiles
 * - Managing user session persistence in `localStorage`
 * - Handling user favorites and email validation
 *
 * All API calls are handled through Angular's `HttpClient`
 * with error handling delegated to `ErrorService`.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  /**
   * Signal holding all registered user emails (used for async validation).
   */
  private userEmails = signal<string[]>([]);
  allUserEmails = this.userEmails.asReadonly();

  /**
   * Signal holding the currently logged-in user.
   */
  private user = signal<User | null>(null);
  currentUser = this.user.asReadonly();

  /**
   * HTTP client for making API requests.
   */
  private http = inject(HttpClient);

  /**
   * Common HTTP headers used in all API requests.
   */
  private httpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  /**
   * Global error service for handling user-visible error messages.
   */
  private errorService = inject(ErrorService);

  /**
   * Angular Router used for navigation after login/logout.
   */
  private router = inject(Router);

  /**
   * Retrieves the current user from localStorage (if available).
   *
   * @returns The user object or `null` if not logged in.
   */
  getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Returns the current user's authentication token.
   *
   * @returns JWT token string or an empty string if not logged in.
   */
  getUserToken(): string {
    return this.getUser()?.token || '';
  }

  /**
   * Checks if a user session is currently active.
   *
   * @returns `true` if a user is logged in, otherwise `false`.
   */
  isLoggedIn(): boolean {
    const user = this.getUser();
    return !!(user && user.token);
  }

  /**
   * Loads the user from localStorage into the reactive signal state.
   */
  loadUser() {
    const user = this.getUser();
    if (user) {
      this.user.set(new User(user));
    }
  }

  /**
   * Persists user data to both signal state and localStorage.
   *
   * @param user - User object to store.
   */
  setUser(user: User) {
    this.user.set(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Updates the user's list of favorite videos both locally and in storage.
   *
   * @param favoriteVideos - Array of favorite video IDs.
   */
  updateUserFavoriteVideos(favoriteVideos: number[]) {
    this.user.update((currenUser) => {
      const updatedUser = new User({
        ...currenUser,
        favorite_videos: favoriteVideos,
      });
      this.setUser(updatedUser);
      return updatedUser;
    });
  }

  /**
   * Loads all registered user emails from the backend.
   * Used mainly for async email validation during signup and forgot-password flows.
   *
   * @returns Observable stream of users.
   */
  loadUserEmails() {
    return this.fetchAllUser().pipe(
      tap({
        next: (users) => {
          const emails = users.map((user: User) => user.email);
          this.userEmails.set(emails);
          this.loadUser();
        },
      })
    );
  }

  /**
   * Fetches all user profiles from the backend.
   *
   * @returns Observable of user profile data.
   */
  fetchAllUser() {
    return this.http
      .get<[]>(`${BASE_URL}/profiles/`, { headers: this.httpHeaders })
      .pipe(
        catchError((error) => {
          this.errorService.showError('Failed to fetch user emails');
          return throwError(() => new Error('Failed to fetch user emails'));
        })
      );
  }

  /**
   * Automatically logs in a user if valid data is found in localStorage.
   *
   * Searches for both "user" and "rememberMe" entries.
   */
  autoLogin() {
    const user =
      localStorage.getItem('user') || localStorage.getItem('rememberMe');
    if (user) {
      const loadedUser = new User(JSON.parse(user));
      this.user.set(loadedUser);
    }
  }

  // /**
  //  * Automatically logs out the user after a given expiration duration.
  //  * (Currently unused)
  //  *
  //  * @param expirationDuration - Duration in milliseconds until logout.
  //  */
  // autoLogout(expirationDuration: number) {
  //   setTimeout(() => {
  //     this.logout();
  //   }, expirationDuration);
  // }

  /**
   * Logs in a user with the provided credentials.
   *
   * @param email - User's email address.
   * @param password - User's password.
   * @returns Observable emitting a `User` object on success.
   */
  login(email: string, password: string) {
    return this.fetchUser(email, password).pipe(
      tap({
        next: (user) => {
          this.user.set(user);
          localStorage.setItem('user', JSON.stringify(user));
        },
      })
    );
  }

  /**
   * Registers a new user.
   *
   * @param email - User email.
   * @param password - User password.
   * @param confirmPassword - Confirmation password.
   * @returns Observable emitting a new `User` on success.
   */
  signup(email: string, password: string, confirmPassword: string) {
    return this.createUser(email, password, confirmPassword);
  }

  /**
   * Initiates a password reset email for the specified address.
   *
   * @param email - User email for password reset.
   * @returns Observable of the backend response.
   */
  forgotPassword(email: string) {
    return this.forgotPasswordUser(email);
  }

  /**
   * Completes the password reset process with provided credentials.
   *
   * @param uid - User ID from reset link.
   * @param token - Reset token.
   * @param newPassword - The new password to set.
   * @returns Observable of the backend response.
   */
  resetPassword(uid: string, token: string, newPassword: string) {
    return this.resetPasswordUser(uid, token, newPassword);
  }

  /**
   * Logs the user out, clears session data, and redirects to the login page.
   */
  logout() {
    this.user.set(null);
    this.router.navigate(['/login'], { replaceUrl: true });
    localStorage.removeItem('user');
  }

  /**
   * Fetches a user by credentials from the backend.
   *
   * @param email - User email.
   * @param password - User password.
   * @returns Observable emitting a `User` object.
   */
  private fetchUser(email: string, password: string) {
    return this.http
      .post<User>(
        `${BASE_URL}/login/`,
        { email, password },
        { headers: this.httpHeaders }
      )
      .pipe(
        catchError((error) => {
          this.errorService.showError('Invalid email or password!');
          return throwError(() => new Error('Failed to fetch user'));
        })
      );
  }

  /**
   * Sends a signup request to create a new user account.
   *
   * @param email - New user's email.
   * @param password - Password.
   * @param confirm_password - Confirmation password.
   * @returns Observable emitting the created `User`.
   */
  private createUser(
    email: string,
    password: string,
    confirm_password: string
  ) {
    return this.http
      .post<User>(
        `${BASE_URL}/register/`,
        { email, password, confirm_password },
        { headers: this.httpHeaders }
      )
      .pipe(
        catchError((error) => {
          this.errorService.showError('Failed to create user');
          return throwError(() => new Error('Failed to create user'));
        })
      );
  }

  /**
   * Sends a password reset email to the backend.
   *
   * @param email - Email of the user requesting password reset.
   * @returns Observable emitting API response.
   */
  private forgotPasswordUser(email: string) {
    return this.http
      .post(
        `${BASE_URL}/forgot-password/`,
        { email },
        { headers: this.httpHeaders }
      )
      .pipe(
        catchError((error) => {
          this.errorService.showError('Failed to send password reset email');
          return throwError(
            () => new Error('Failed to send password reset email')
          );
        })
      );
  }

  /**
   * Submits a password reset request to the backend.
   *
   * @param uid - User ID from reset link.
   * @param token - Token validating the reset request.
   * @param new_password - New password chosen by the user.
   * @returns Observable emitting backend response.
   */
  private resetPasswordUser(uid: string, token: string, new_password: string) {
    return this.http
      .post(
        `${BASE_URL}/reset-password/`,
        { uid, token, new_password },
        { headers: this.httpHeaders }
      )
      .pipe(
        catchError((error) => {
          this.errorService.showError('Failed to reset password');
          return throwError(() => new Error('Failed to reset password'));
        })
      );
  }
}
