import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

import { Filesystem, Directory } from '@capacitor/filesystem';
import { HttpClient } from '@angular/common/http';
import { ActionSheetController, LoadingController, NavController, Platform, ToastController } from '@ionic/angular';

import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { finalize } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

const IMAGE_DIR = 'stored-images';

interface LocalFile {
  name: string;
  path: string;
  data: string;
}

export interface FILE {
  name: string;
  filepath: string;
  size: number;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  avatar: string = "";
  name: string = "";
  email: string = "";
  tokenInfo: any;

  images: LocalFile[] = [];

  constructor(
    private jwtHelper: JwtHelperService,
    private navCtrl: NavController,
    public actionSheetCtrl: ActionSheetController,
    public toastCtrl: ToastController,
    private plt: Platform,
    private http: HttpClient,
    private loadingCtrl: LoadingController) { }

  ngOnInit() {
    this.tokenInfo = this.jwtHelper.decodeToken(localStorage.getItem("token"));
    this.avatar = this.tokenInfo.avatar;
    this.name = this.tokenInfo["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
    this.email = this.tokenInfo["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
  }

  uploadFile() {    
  }

  logout() {
    localStorage.removeItem("token");
    this.navCtrl.navigateRoot("/login", { animated: true, animationDirection: 'forward' });
  }

  // Get the actual base64 data of an image
  // base on the name of the file
  async loadFileData(fileNames: string[]) {
    for (let f of fileNames) {
      const filePath = `${IMAGE_DIR}/${f}`;

      const readFile = await Filesystem.readFile({
        path: filePath,
        directory: Directory.Data,
      });

      this.images.push({
        name: f,
        path: filePath,
        data: `data:image/jpeg;base64,${readFile.data}`,
      });
    }
  }

  // Little helper
  async presentToast(text) {
    const toast = await this.toastCtrl.create({
      message: text,
      duration: 3000,
    });
    toast.present();
  }

  async startUpload(file: LocalFile) {
    const response = await fetch(file.data);
    const blob = await response.blob();
    const formData = new FormData();
    formData.append('photo', blob, file.name);
    this.uploadData(formData);
  }

  async uploadData(formData: FormData) {
    const loading = await this.loadingCtrl.create({
      message: 'Subiendo imagen...',
    });
    await loading.present();

    // Use your own API!
    this.http.post(environment.apiUrl+"/profile/update/avatar", formData)
      .pipe(
        finalize(() => {
          loading.dismiss();
        })
      )
      .subscribe({
        next: (response: any) => {
          this.presentToast('La imagen se ha subido exitosamente.')
          this.avatar = response.avatar;
        },
        error: () => {
          this.presentToast('Error al subir la imagen, intente nuevamente mas tarde.')
        }
      });
  }

  async selectImage() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Prompt,
      promptLabelHeader: "Foto",
      promptLabelCancel: "Cancelar",
      promptLabelPhoto: "Desde la galeria",
      promptLabelPicture: "Tomar foto"
    });
    if (image) {
      this.saveImage(image)
    }
  }

  // Create a new file from a capture image
  async saveImage(photo: Photo) {
    const base64Data = await this.readAsBase64(photo);

    const fileName = 'avatar.' + photo.format;
    const savedFile = await Filesystem.writeFile({
      path: `${IMAGE_DIR}/${fileName}`,
      data: base64Data,
      directory: Directory.Data
    });

    // Reload the file list
    // Improve by only loading for the new image and unshifting array!
    this.startUpload(
      { 
        name: fileName,
        path: `${IMAGE_DIR}/${fileName}`,
        data: base64Data,
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

      return await this.convertBlobToBase64(blob) as string;
    }
  }

  // Helper function
  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

}