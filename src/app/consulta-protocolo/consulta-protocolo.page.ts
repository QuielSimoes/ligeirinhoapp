import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from './../services/api.service';
import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { AlertController, LoadingController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { ConsultaProtocoloResponse } from '../services/interfaces/consultar-protocolo/consulta-protocolo-response';

@Component({
  selector: 'app-consulta-protocolo',
  templateUrl: './consulta-protocolo.page.html',
  styleUrls: ['./consulta-protocolo.page.scss'],
})
export class ConsultaProtocoloPage implements OnInit {

  public protocolo: FormGroup;
  nuProtocolo = '';
  private scanActive = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private alertController: AlertController,
    private router: Router,
    private loadingController: LoadingController) { }

  ngOnInit() {
    this.protocolo = this.fb.group({
      protocolo: ['', Validators.required]
    });
  }

  async checkPermission() {
    return new Promise(async (resolve, reject) => {
      const status = await BarcodeScanner.checkPermission({ force: true });
      if (status.granted) {
        resolve(true);
      } else if (status.denied) {
        BarcodeScanner.openAppSettings();
        resolve(false);
      }
    });
  }

  async startScanner() {
    const allowed = await this.checkPermission();
    //document.body.style.setProperty('--ion-background-color', 'transparent');
    if (allowed) {
      this.scanActive = true;
      BarcodeScanner.hideBackground();

      const result = await BarcodeScanner.startScan();

      if (result.hasContent) {
        this.scanActive = false;
        this.protocolo.setValue({
          protocolo: result.content
        });

        this.consultarProtocolo();
      } else {
        const alert = await this.alertController.create({
          header: 'Aviso',
          message: 'Protocolo inválido ou não presente no Qr Code.',
          buttons: ['OK']
        });
        await alert.present();
      }
    } else {
      const alert = await this.alertController.create({
        header: 'Aviso',
        message: 'Permissão de acesso a câmera negada ao aplicativo, por favor ajuste as permissões para prosseguir.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  stopScanner() {
    BarcodeScanner.stopScan();
    this.scanActive = false;
  }

  async consultarProtocolo() {
    const loading = await this.loadingController.create();
    await loading.present();

    this.apiService.consultarProtocolo(this.protocolo.value).subscribe(
      async (res: ConsultaProtocoloResponse) => {
        await loading.dismiss();
        this.protocolo.setValue({
          protocolo: ''
        });
        if(res.ok) {
          const navigationExtras: NavigationExtras = {
            state: res
          };
          this.router.navigateByUrl('/retorno-ar', navigationExtras);
        } else {
          const alert = await this.alertController.create({
            header: 'Ops!',
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

  ionViewWillLeave() {
    if(this.scanActive) {
      BarcodeScanner.stopScan();
      this.scanActive = false;
    }
  }

  logout() {
    this.apiService.logout();
  }

}
