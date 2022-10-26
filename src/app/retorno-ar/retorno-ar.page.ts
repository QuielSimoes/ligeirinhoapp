import { Component, OnInit } from '@angular/core';
import { Filesystem, Directory, FileInfo } from '@capacitor/filesystem';
import { HttpClient } from '@angular/common/http';
import { Platform, LoadingController, ToastController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { finalize } from 'rxjs/operators';
import { Storage } from '@ionic/storage';
import { Geolocation } from '@capacitor/geolocation';

const IMAGE_DIR = 'stored-images';

const convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = reject;
  reader.onload = () => {
      resolve(reader.result);
  };
  reader.readAsDataURL(blob);
});

const printCurrentPosition = async () => {
  const coordinates = await Geolocation.getCurrentPosition();

  console.log('Current position:', coordinates);
};

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
  public formRetornoAr: any = {
		situacao: '1'
	};

  constructor(
    private plt: Platform,
    private http: HttpClient,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private storage: Storage
  ) { }

  ngOnInit() {
    this.carregarFotos();
    this.carregarSituacoes();
  }

  /**
   * Carrega as situações a partir do storage (login)
   */
  async carregarSituacoes() {
    this.situacoes = (await this.storage.get('SITUACOES')) as Lista[];
  }

  async carregarFotos() {
		this.images = [];
    printCurrentPosition();

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
  async startUpload(file: LocalFile) {
    const response = await fetch(file.data);
    const blob = await response.blob();
    const formData = new FormData();
    formData.append('file', blob, file.name);
    this.uploadData(formData);
  }

  // Upload the formData to our API
  async uploadData(formData: FormData) {
    const loading = await this.loadingCtrl.create({
        message: 'Uploading image...',
    });
    await loading.present();

    // Use your own API!
    const url = 'http://localhost:8888/images/upload.php';

    this.http.post(url, formData)
        .pipe(
            finalize(() => {
                loading.dismiss();
            })
        )
        .subscribe(res => {
            // eslint-disable-next-line @typescript-eslint/dot-notation
            if (res['success']) {
                this.presentToast('File upload complete.');
            } else {
                this.presentToast('File upload failed.');
            }
        });
  }

  async deleteImage(file: LocalFile) {
    await Filesystem.deleteFile({
        directory: Directory.Data,
        path: file.path
    });
    this.carregarFotos();
    this.presentToast('Foto removida.');
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


