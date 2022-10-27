import { BehaviorSubject, from, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { LoginRequest } from './interfaces/login/login-request';
import { tap } from  'rxjs/operators';
import { LoginResponse } from './interfaces/login/login-response';
import { ConsultaProtocoloRequest } from './interfaces/consultar-protocolo/consulta-protocolo-request';

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
        if (loginResponse.ok) {
          const situacoes = loginResponse.dados.situacoesNegativas;
          //console.log(loginResponse.dados.situacoesNegativas, 'situacoesNegativas');
          await this.storage.set('ID', loginResponse.dados.id);
          await this.storage.set('NOME', loginResponse.dados.nome);
          await this.storage.set('FOTO', loginResponse.dados.foto);
          await this.storage.set('ULTIMO_ACESSO', loginResponse.dados.ultimoAcesso);
          await this.storage.set('TOKEN', loginResponse.dados.token);
          await this.storage.set('SITUACOES', situacoes);
          this.isAuthenticated.next(true);
        }
      })
    );
  }

  logout() {
    this.storage.remove('TOKEN');
    this.isAuthenticated.next(false);
    this.router.navigateByUrl('/', {replaceUrl: true});
  }

  consultarProtocolo(dados: ConsultaProtocoloRequest): Observable<any> {
    return this.http.post(`${this.url}consultarProtocolo.json`, dados);
  }

  baixarProtocolo(dados: FormData): Observable<any> {
    return this.http.post(`${this.url}baixarProtocolo.json`, dados);
  }
}
