import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private _error = signal('');
  private _success = signal('');

  error = this._error.asReadonly();

  showError(message: string) {
    this._error.set(message);
    setTimeout(() => {
      this.clearError();
    }, 3000);
  }

  showSuccess(message: string) {
    this._success.set(message);
    setTimeout(() => {
      this.clearError();
    }, 3000);
  }

  clearError() {
    this._error.set('');
    this._success.set('');
  }
}