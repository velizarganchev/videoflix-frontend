import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';

interface User {
  id: number,
  token: string,
  username: string,
  email: string,
  phone: string | null,
  address: string | null
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user = signal<User | null>(null);
  private http = inject(HttpClient);  

  constructor() {

  }


}
