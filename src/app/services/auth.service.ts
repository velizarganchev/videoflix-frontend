import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { User } from '../models/user.class';
import { ErrorService } from './error.service';
import { catchError, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { use } from 'video.js/dist/types/tech/middleware';

const BASE_URL = 'http://127.0.0.1:8000/api';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userEmails = signal<string[]>([]);
  allUserEmails = this.userEmails.asReadonly();

  private user = signal<User | null>(null);
  currentUser = this.user.asReadonly();

  private http = inject(HttpClient);
  private httpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  private errorService = inject(ErrorService);
  private router = inject(Router);

  getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getUserToken(): string {
    return this.getUser()?.token || '';
  }

  isLoggedIn(): boolean {
    const user = this.getUser();
    return !!(user && user.token);
  }

  loadUser() {
    const user = this.getUser();
    if (user) {
      this.user.set(new User(user));
    }
  }

  setUser(user: User) {
    this.user.set(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  updateUserFavoriteVideos(favoriteVideos: number[]) {
    this.user.update((currenUser) => {
      const updatedUser = new User({ ...currenUser, favorite_videos: favoriteVideos });
      this.setUser(updatedUser);
      return updatedUser;
    })
  }

  loadUserEmails() {
    return this.fetchAllUser().pipe(
      tap({
        next: (users) => {
          const emails = users.map((user: User) => user.email);
          this.userEmails.set(emails);
          this.loadUser();
        },
      }),
    );
  }

  fetchAllUser() {
    return this.http
      .get<[]>(`${BASE_URL}/users/profiles/`, { headers: this.httpHeaders }).pipe(
        catchError((error) => {
          this.errorService.showError('Failed to fetch user emails');
          return throwError(() => new Error('Failed to fetch user emails'));
        })
      );
  }

  autoLogin() {
    const user =
      localStorage.getItem('user') || localStorage.getItem('rememberMe');
    if (user) {
      const loadedUser = new User(JSON.parse(user));
      this.user.set(loadedUser);
    }
  }

  // autoLogout(expirationDuration: number) {
  //   setTimeout(() => {
  //     this.logout();
  //   }, expirationDuration);
  // }

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

  signup(email: string, password: string, confirmPassword: string) {
    return this.createUser(email, password, confirmPassword);
  }

  forgotPassword(email: string) {
    return this.forgotPasswordUser(email);
  }

  resetPassword(uid: string, token: string, newPassword: string) {
    return this.resetPasswordUser(uid, token, newPassword);
  }

  logout() {
    this.user.set(null);
    this.router.navigate(['/login']);
    localStorage.removeItem('user');
  }

  private fetchUser(email: string, password: string) {
    return this.http
      .post<User>(
        `${BASE_URL}/users/login/`,
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

  private createUser(email: string, password: string, confirm_password: string) {
    return this.http
      .post<User>(
        `${BASE_URL}/users/register/`,
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

  private forgotPasswordUser(email: string) {
    return this.http.post(`${BASE_URL}/users/forgot-password/`, { email }, { headers: this.httpHeaders }).pipe(
      catchError((error) => {
        this.errorService.showError('Failed to send password reset email');
        return throwError(() => new Error('Failed to send password reset email'));
      })
    );
  }

  private resetPasswordUser(uid: string, token: string, new_password: string) {
    return this.http.post(`${BASE_URL}/users/reset-password/`, { uid, token, new_password }, { headers: this.httpHeaders }).pipe(
      catchError((error) => {
        this.errorService.showError('Failed to reset password');
        return throwError(() => new Error('Failed to reset password'));
      })
    );
  }
}