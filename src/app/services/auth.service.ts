import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, of, OperatorFunction, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User } from '../models/user.class';
import { environment } from '../../../environments/environment.prod';

type EmailExistsResponse = { exists: boolean };

// Server responses (adjust if your backend returns additional data)
type LoginResponse = User;
type RegisterResponse = { email?: string } | { email?: [] };
type VoidResponse = unknown;

const SESSION_USER_KEY = 'vf_current_user';

/**
 * AuthService
 *
 * Handles authentication-related HTTP calls and minimal client-side state:
 * - login / logout / refresh token
 * - register, forgot password, reset password
 * - keep a lightweight "current user" in memory + sessionStorage
 *
 * Tokens (access / refresh) are stored in HTTP-only cookies on the backend.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Base API root (no trailing slash). */
  private readonly api = environment.baseApiUrl.replace(/\/$/, '');
  /** Users endpoint base: <api>/users */
  private readonly users = `${this.api}/users`;

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  /** Internal signal holding the current public user (no password/token stored). */
  private readonly _currentUser = signal<User | null>(null);

  /** Read-only signal API for templates & components. */
  readonly currentUser = computed(() => this._currentUser());

  constructor() {
    this.hydrateFromSession();
  }

  /**
   * Rehydrate the in-memory user from session storage.
   * Stores only public, non-sensitive user fields.
   */
  hydrateFromSession(): void {
    try {
      const raw = sessionStorage.getItem(SESSION_USER_KEY);
      if (raw) {
        const user = JSON.parse(raw) as User;
        this._currentUser.set(user);
      }
    } catch {
      sessionStorage.removeItem(SESSION_USER_KEY);
    }
  }

  /**
   * Persist the current user (or clear) in session storage.
   */
  private persistUser(user: User | null): void {
    if (user) {
      sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(SESSION_USER_KEY);
    }
  }

  /**
   * Login with email/password and optional "remember" flag.
   *
   * Stores only public user data in memory + sessionStorage.
   * Tokens remain in secure cookies managed by the backend.
   */
  login(email: string, password: string, remember = false): Observable<User> {
    return this.http.post<LoginResponse>(
      `${this.users}/login/`,
      { email, password, remember },
      { withCredentials: true }
    ).pipe(
      tap((user) => {
        this._currentUser.set(user);
        this.persistUser(user);
      })
    );
  }

  /**
   * Refresh the access cookie using the refresh cookie.
   * No user payload is required or returned.
   */
  refresh(): Observable<void> {
    return this.http.post<VoidResponse>(
      `${this.users}/refresh/`,
      {},
      { withCredentials: true }
    ) as Observable<void>;
  }

  /**
   * Logout server-side (clears cookies) and reset local state.
   *
   * Uses clearUserAndRedirect() operator to:
   * - clear the in-memory user
   * - clear sessionStorage
   * - navigate to /login
   */
  logout(): Observable<void> {
    return this.http.post<VoidResponse>(
      `${this.users}/logout/`,
      {},
      { withCredentials: true }
    ).pipe(
      this.clearUserAndRedirect(),
      catchError(err => {
        if (err.status === 401) {
          this.clientLogout();
          this.router.navigate(['/login'], { replaceUrl: true });
          return of(void 0);
        }
        return throwError(() => err);
      })
    );
  }

  /**
   * Signup a new user.
   * The backend is responsible for sending any confirmation email.
   */
  signup(email: string, password: string, confirmPassword: string): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.users}/register/`,
      { email, password, confirm_password: confirmPassword },
      { withCredentials: true }
    );
  }

  /**
   * Request password reset (email with reset link).
   */
  forgotPassword(email: string): Observable<void> {
    return this.http.post<VoidResponse>(
      `${this.users}/forgot-password/`,
      { email },
      { withCredentials: true }
    ) as Observable<void>;
  }

  /**
   * Submit new password using uid + token from the reset link.
   */
  resetPassword(uid: string, token: string, newPassword: string): Observable<void> {
    return this.http.post<VoidResponse>(
      `${this.users}/reset-password/`,
      { uid, token, new_password: newPassword },
      { withCredentials: true }
    ) as Observable<void>;
  }

  /**
   * Check if an email is already registered.
   *
   * GET /users/email-exists/?email=foo@bar.com -> { exists: boolean }
   */
  checkEmailExists(email: string): Observable<EmailExistsResponse> {
    const params = new HttpParams().set('email', email);
    return this.http.get<EmailExistsResponse>(
      `${this.users}/email-exists/`,
      { params, withCredentials: true }
    );
  }

  /**
   * RxJS operator: clears the current user and redirects to the login page.
   *
   * Intended for use in the logout() pipeline:
   * this.http.post(...).pipe(this.clearUserAndRedirect())
   */
  clearUserAndRedirect(): OperatorFunction<unknown, void> {
    return (source) =>
      source.pipe(
        tap(() => {
          this._currentUser.set(null);
          this.persistUser(null);
          this.router.navigate(['/login'], { replaceUrl: true });
        }),
        map(() => undefined)
      );
  }

  // --- helper signals/methods ---

  /**
   * Returns `true` when a user is present in memory.
   * Note: tokens are never stored in browser storage.
   */
  readonly isAuthenticated = computed(() => !!this._currentUser());

  /**
   * Clear client-side auth state without calling the API.
   *
   * Used from the HTTP interceptor when refresh fails
   * (e.g. both access and refresh tokens are invalid).
   */
  clientLogout(): void {
    this._currentUser.set(null);
    this.persistUser(null);
  }

  /**
   * Patch the in-memory current user immutably and persist to sessionStorage.
   */
  patchCurrentUser(patch: Partial<User>): void {
    const u = this._currentUser();
    if (!u) return;
    const merged: User = { ...u, ...patch };
    this._currentUser.set(merged);
    this.persistUser(merged);
  }

  /**
   * Convenience helper: replace the favorite_videos list on the current user.
   */
  setFavoriteVideos(favorite_videos: number[]): void {
    this.patchCurrentUser({ favorite_videos });
  }
}
