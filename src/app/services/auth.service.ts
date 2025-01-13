import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { User } from '../models/user.class';
import { ErrorService } from './error.service';
import { catchError, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private user = signal<User | null>(null);
  currentUser = this.user.asReadonly();

  private http = inject(HttpClient);
  private httpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  private errorService = inject(ErrorService);
  private router = inject(Router);

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

  signup(email: string, password: string) {
    return this.createUser(email, password).pipe(
      tap({
        next: (response) => {
          console.log(response);
        },
      })
    );
  }

  logout() {
    this.user.set(null);
    this.router.navigate(['/login']);
    localStorage.removeItem('user');
  }

  private fetchUser(email: string, password: string) {
    return this.http
      .post<User>(
        'http://127.0.0.1:8000/api/users/login/',
        { email, password },
        { headers: this.httpHeaders }
      )
      .pipe(
        catchError((error) => {
          this.errorService.showError('Failed to login');
          return throwError(() => new Error('Failed to login'));
        })
      );
  }

  private createUser(email: string, password: string) {
    return this.http
      .post<User>(
        'http://127.0.0.1:8000/api/users/login/',
        { email, password },
        { headers: this.httpHeaders }
      )
      .pipe(
        catchError((error) => {
          this.errorService.showError('Failed to create user');
          return throwError(() => new Error('Failed to create user'));
        })
      );
  }
}
