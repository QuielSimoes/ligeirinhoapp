import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';
import { User } from './user';
import { AuthResponse } from './auth-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authServerAddress = 'http://localhost:3000';
  private authSubject = new BehaviorSubject(false);

  constructor(private httpClient: HttpClient, private storage: Storage) {
  }

  register(user: User): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(`${this.authServerAddress}/register`, user).pipe(
      tap(async (res:  AuthResponse ) => {
          await this.storage.set('ACCESS_TOKEN', res.accessToken);
          await this.storage.set('EXPIRES_IN', res.expiresIn);
          this.authSubject.next(true);
      })

    );
  }

  login(user: User): Observable<AuthResponse> {
    return this.httpClient.post(`${this.authServerAddress}/login`, user).pipe(
      tap(async (res: AuthResponse) => {
          await this.storage.set('ACCESS_TOKEN', res.accessToken);
          await this.storage.set('EXPIRES_IN', res.expiresIn);
          this.authSubject.next(true);
      })
    );
  }

  async logout() {
    await this.storage.remove('ACCESS_TOKEN');
    await this.storage.remove('EXPIRES_IN');
    this.authSubject.next(false);
  }

  isLoggedIn() {
    return this.authSubject.asObservable();
  }

}
