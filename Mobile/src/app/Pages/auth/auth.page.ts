import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/Services/Auth/auth.service';

import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  LoginCard: boolean = true;

  Loading: boolean = false;

  loginForm = {
    email: '',
    password: '',
  };

  registerForm = {
    email: '',
    name: '',
    password: '',
  };

  token: string | null = null;

  constructor(
    public alertController: AlertController,
    private router: Router,
    private http: HttpClient,
    private navCtrl: NavController
  ) {}

  async ngOnInit() {
   this.presentAlert(); 
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Aviso',
      message: 'Esta APP se encuentra en version beta, es posible encontrar errores en su uso.<br/> Errores conocidos:<br/> -Al cambias de tabs y volver a home, la tab de home no enciende.<br/> -El Grid del juego puede no adaptarce a ciertas pantallas, pero igualmente es jugable.',
      buttons: ['OK']
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }
  

  async showAlert(msg: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      subHeader: 'Error al iniciar sesion',
      message: msg,
      buttons: ['OK'],
    });

    await alert.present();
    await alert.onDidDismiss();
  }

  login() {
    this.Loading = true;
    if (!this.loginForm.email || !this.loginForm.password) {
      this.showAlert('Los campos no pueden estar vacios.').then(
        () => (this.Loading = false)
      );
    }
    const payload = {
      email: this.loginForm.email,
      password: this.loginForm.password,
    };

    this.http.post(`${environment.apiUrl}/auth/login`, payload).subscribe(
      (response: any) => {
        localStorage.setItem('token', response.token);
        this.Loading = false;
        this.navCtrl.navigateRoot("/home", { animated: true, animationDirection: 'forward' });
      },
      async (error) => {
        await this.showAlert(error.error).then(() => (this.Loading = false));
      }
    );
  }

  async register() {
    this.Loading = true;
    if (
      !this.registerForm.email ||
      !this.registerForm.name ||
      !this.registerForm.password
    ) {
      await this.showAlert('Los campos no pueden estar vacios.').then(
        () => (this.Loading = false)
      );
    }

    const payload = {
      email: this.registerForm.email,
      name: this.registerForm.name,
      password: this.registerForm.password,
    };

    this.http
      .post(environment.apiUrl + '/auth/register', payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
      .subscribe({
        next: (response: any) => {
          localStorage.setItem('token', response.token);
          this.Loading = false;
          this.navCtrl.navigateRoot("/home", { animated: true, animationDirection: 'forward' });
        },
        error: async (error) => {
          await this.showAlert(error.error).then(() => (this.Loading = false));
        },
      });
  }

  ChangeCard() {
    this.Loading = true;
    this.LoginCard = !this.LoginCard;
    this.Loading = false;
  }
}
