import { HttpErrorResponse } from '@angular/common/http';
import { LoginResponse } from './../services/interfaces/login/login-response';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { AlertController, LoadingController } from '@ionic/angular';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  credenciais: FormGroup;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private alertController: AlertController,
    private router: Router,
    private loadingController: LoadingController) { }

  ngOnInit() {
    this.credenciais = this.fb.group({
      login: ['', Validators.required],
      senha: ['', Validators.required]
    });
  }

  async login() {
    const loading = await this.loadingController.create();
    await loading.present();

    this.apiService.login(this.credenciais.value).subscribe(
      async (res: LoginResponse) => {
        await loading.dismiss();
        if(res.ok) {
          this.router.navigateByUrl('/consulta-protocolo', {replaceUrl: true});
        } else {
          const alert = await this.alertController.create({
            header: 'Falha no login',
            message: res.msg,
            buttons: ['OK']
          });
          await alert.present();
        }
      },
      async (error: HttpErrorResponse) => {
        loading.dismiss();
        console.log(error);
        if (error.error instanceof Error) {
          console.log('Client-side error occured.');
        } else {
            console.log('Server-side error occured.');
        }

        const alert = await this.alertController.create({
          header: 'Aviso',
          message: 'Serviço indisponível, por favor tente novamente mais tarde.',
          buttons: ['OK']
        });
        await alert.present();
      }
    );
  }

  onSubmit() {
    this.router.navigate( ['/consulta-protocolo'] );
  }

}
