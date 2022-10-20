import { BehaviorSubject, from, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { LoginRequest } from './interfaces/login/login-request';
import { tap } from  'rxjs/operators';
import { LoginResponse } from './interfaces/login/login-response';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  currentAccessToken = null;
  url = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router,
    private storage: Storage) {
    this.loadToken();
  }

  async loadToken() {
    const token = await this.storage.get('TOKEN');
    if(token) {
      this.currentAccessToken = token;
      this.isAuthenticated.next(true);
    } else {
      this.isAuthenticated.next(false);
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.url}autenticar.json`, credentials).pipe(
      tap(async (loginResponse: LoginResponse) => {
        //console.log(loginResponse);
        if (loginResponse.ok) {
          await this.storage.set('ID', loginResponse.dados.id);
          await this.storage.set('NOME', loginResponse.dados.nome);
          await this.storage.set('FOTO', loginResponse.dados.foto);
          await this.storage.set('ULTIMO_ACESSO', loginResponse.dados.ultimoAcesso);
          await this.storage.set('TOKEN', loginResponse.dados.token);
          this.isAuthenticated.next(true);
        }
        //return loginResponse;
      })
    );
  }

  logout() {
    this.storage.remove('TOKEN');
    this.isAuthenticated.next(false);
    this.router.navigateByUrl('/', {replaceUrl: true});
  }
}