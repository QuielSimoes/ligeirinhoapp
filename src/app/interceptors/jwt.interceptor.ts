import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { ApiService } from '../services/api.service';
import { catchError } from 'rxjs/operators';
import { ToastController } from '@ionic/angular';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  // Used for queued API calls while refreshing tokens
  tokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  isRefreshingToken = false;

  constructor(private apiService: ApiService, private toastCtrl: ToastController) { }

  // Intercept every HTTP call
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // Check if we need additional token logic or not
    if (this.isInBlockedList(request.url)) {
      return next.handle(request);
    } else {
      return next.handle(this.addToken(request)).pipe(
        catchError(err => {
          if (err instanceof HttpErrorResponse) {
            switch (err.status) {
              case 400:
                return this.handle400Error(err);
              default:
                return throwError(err);
            }
          } else {
            return throwError(err);
          }
        })
      ) as Observable<HttpEvent<any>>;
    }
  }

  // Filter out URLs where you don't want to add the token!
  private isInBlockedList(url: string): boolean {
    // Example: Filter out our login and logout API call
    if (url === `${environment.apiUrl}/autenticar.json`) {
      return true;
    } else {
      return false;
    }
  }

  // Add our current access token from the service if present
  private addToken(req: HttpRequest<any>) {
    if (this.apiService.currentAccessToken) {
      return req.clone({
        headers: new HttpHeaders({
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Authorization: `Bearer ${this.apiService.currentAccessToken}`
        })
      });
    } else {
      return req;
    }
  }

  private async handle400Error(err) {
    // Potentially check the exact error reason for the 400
    // then log out the user automatically
    const toast = await this.toastCtrl.create({
      message: 'Sua sessão expirou, por favor autentique novamente.',
      duration: 2000
    });
    toast.present();
    this.apiService.logout();
    return of(null);
  }
}
