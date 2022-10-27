import { BaixarProtocoloResponse } from './../services/interfaces/baixar-protocolo/baixar-protocolo-response';
import { ApiService } from './../services/api.service';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Filesystem, Directory, FileInfo } from '@capacitor/filesystem';
import { HttpClient } from '@angular/common/http';
import { Platform, LoadingController, ToastController, AlertController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { finalize } from 'rxjs/operators';
import { Storage } from '@ionic/storage';
import { Geolocation } from '@capacitor/geolocation';
import { ConsultaProtocoloResponse } from '../services/interfaces/consultar-protocolo/consulta-protocolo-response';

const IMAGE_DIR = 'stored-images';

const convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = reject;
  reader.onload = () => {
      resolve(reader.result);
  };
  reader.readAsDataURL(blob);
});

interface LocalFile {
	name: string;
	path: string;
	data: string;
}

interface Lista {
  id: number;
  nome: string;
}

@Component({
  selector: 'app-retorno-ar',
  templateUrl: './retorno-ar.page.html',
  styleUrls: ['./retorno-ar.page.scss'],
})
export class RetornoArPage implements OnInit {

  images: LocalFile[] = [];
  situacoes: Lista[] = [];
  nuProtocolo = '';

  public formRetornoAr: any = {
    idTransacao: null,
		idSituacao: '1',
    idMotivoNegativa: null,
    latitude: 0,
    longitude: 0
	};

  constructor(
    private plt: Platform,
    private http: HttpClient,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private storage: Storage,
    private router: Router,
    private apiService: ApiService,
    private alertController: AlertController
  ) { }

  atualizarCoordenadas = async () => {
    const coordinates = await Geolocation.getCurrentPosition();
    this.formRetornoAr.latitude = coordinates.coords.latitude;
    this.formRetornoAr.longitude = coordinates.coords.longitude;
  };

  ngOnInit() {
    const routerState = this.router.getCurrentNavigation().extras.state as ConsultaProtocoloResponse;
    if(routerState !== undefined) {
      this.formRetornoAr.idTransacao = routerState.dados.idTransacao;
      this.nuProtocolo = routerState.dados.nuProtocoloCartorio;
    }

    this.carregarFotos();
    this.carregarSituacoes();
    this.atualizarCoordenadas();
  }

  ionViewWillEnter() {
    this.limparFormulario();
  }

  limparFormulario() {
    this.formRetornoAr = {
      idTransacao: null,
      idSituacao: '1',
      idMotivoNegativa: null,
      latitude: 0,
      longitude: 0
    };
  }

  /**
   * Carrega as situações a partir do storage (login)
   */
  async carregarSituacoes() {
    this.situacoes = (await this.storage.get('SITUACOES')) as Lista[];
  }

  async carregarFotos() {
		this.images = [];

		const loading = await this.loadingCtrl.create({
			message: 'Carregando...'
		});
		await loading.present();

		Filesystem.readdir({
			path: IMAGE_DIR,
			directory: Directory.Data
		})
			.then(
				(result) => {
					this.loadFileData(result.files);
				},
				async (err) => {
					// Folder does not yet exists!
					await Filesystem.mkdir({
						path: IMAGE_DIR,
						directory: Directory.Data
					});
				}
			)
			.then((_) => {
				loading.dismiss();
			});
	}

  // Get the actual base64 data of an image
	// base on the name of the file
	async loadFileData(fileNames: FileInfo[]) {
		for (const f of fileNames) {
			const filePath = `${IMAGE_DIR}/${f.name}`;

			const readFile = await Filesystem.readFile({
				path: filePath,
				directory: Directory.Data
			});

			this.images.push({
				name: f.name,
				path: filePath,
				data: `data:image/jpeg;base64,${readFile.data}`
			});
		}
	}

  // Little helper
	async presentToast(text) {
		const toast = await this.toastCtrl.create({
			message: text,
			duration: 3000
		});
		toast.present();
	}

	async selectImage() {
    const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera // Camera, Photos or Prompt!
    });

    if (image) {
        this.saveImage(image);
    }
  }

  // Create a new file from a capture image
  async saveImage(photo: Photo) {
      const base64Data = await this.readAsBase64(photo);

      const fileName = new Date().getTime() + '.jpeg';
      const savedFile = await Filesystem.writeFile({
          path: `${IMAGE_DIR}/${fileName}`,
          data: base64Data,
          directory: Directory.Data
      });

      // Reload the file list
      // Improve by only loading for the new image and unshifting array!
      this.carregarFotos();
  }

  // Convert the base64 to blob data
  // and create  formData with it
  /* async startUpload(file: LocalFile) {
    const response = await fetch(file.data);
    const blob = await response.blob();
    const formData = new FormData();
    formData.append('file', blob, file.name);
    this.uploadData(formData);
  } */

  // Upload the formData to our API
  async baixarProtocolo() {
    const loading = await this.loadingCtrl.create({
        message: 'Aguarde...',
    });
    await loading.present();

    // Monta os dados para envio para o backend
    const formData = new FormData();
    formData.append('idTransacao', this.formRetornoAr.idTransacao);
    formData.append('idSituacao', this.formRetornoAr.idSituacao);
    formData.append('idMotivoNegativa', this.formRetornoAr.idMotivoNegativa);
    formData.append('latitude', this.formRetornoAr.latitude);
    formData.append('longitude', this.formRetornoAr.longitude);
    //console.log(formData, 'formData');

    // Adiciona as imagens no formulário para envio ao backend
    Filesystem.readdir({
			path: IMAGE_DIR,
			directory: Directory.Data
		})
    .then( async (result) => {
      for (const f of result.files) {
        const filePath = `${IMAGE_DIR}/${f.name}`;

        const readFile = await Filesystem.readFile({
          path: filePath,
          directory: Directory.Data
        });

        const dataFile = `data:image/jpeg;base64,${readFile.data}`;

        const response = await fetch(dataFile);
        const blob = await response.blob();
        formData.append('foto[]', blob, f.name);

      }
    });

    this.apiService.baixarProtocolo(formData).subscribe(
      async (retornobaixa: BaixarProtocoloResponse) => {
        loading.dismiss();
        if(retornobaixa.ok) {
          // Remove as imagens
          await this.removerTodasImagens();
          // Vai para rota final
          const navigationExtras: NavigationExtras = {
            state: retornobaixa
          };
          this.router.navigateByUrl('/final', navigationExtras);
        } else {
          const alert = await this.alertController.create({
            header: 'Ops!',
            message: retornobaixa.msg,
            buttons: ['OK']
          });
          await alert.present();
        }
      }
    );
  }

  async deleteImage(file: LocalFile) {
    await Filesystem.deleteFile({
        directory: Directory.Data,
        path: file.path
    });
    this.carregarFotos();
    this.presentToast('Foto removida.');
  }

  /**
   * Remove todas imagens do app
   */
  async removerTodasImagens() {

    Filesystem.readdir({
			path: IMAGE_DIR,
			directory: Directory.Data
		})
    .then( async (result) => {
      for (const f of result.files) {
        const filePath = `${IMAGE_DIR}/${f.name}`;

        await Filesystem.deleteFile({
          directory: Directory.Data,
          path: filePath
        });

      }
    });
  }

  // https://ionicframework.com/docs/angular/your-first-app/3-saving-photos
  private async readAsBase64(photo: Photo) {
    if (this.plt.is('hybrid')) {
        const file = await Filesystem.readFile({
            path: photo.path
        });

        return file.data;
    }
    else {
        // Fetch the photo, read as a blob, then convert to base64 format
        const response = await fetch(photo.webPath);
        const blob = await response.blob();

        return await convertBlobToBase64(blob) as string;
    }
  }

}


