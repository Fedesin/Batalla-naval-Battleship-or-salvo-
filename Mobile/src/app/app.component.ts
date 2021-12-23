import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Platform } from '@ionic/angular';
import { StatusBar } from '@capacitor/status-bar';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})

export class AppComponent {

  constructor(
    private platform: Platform,
    private router: Router,
    private http: HttpClient,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.backButton.subscribeWithPriority(-1, () => {
      navigator['app'].exitApp();
    });
    this.platform.ready().then(async () => {
      StatusBar.setOverlaysWebView({ overlay: false });
      StatusBar.hide();
      const token = localStorage.getItem('token');
      if (token == null) { this.router.navigate(['login']); }
      else {
        this.http
          .post(
            `${environment.apiUrl}/auth/verify`,
            {},
            {
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Authorization': `Bearer ${token}`,
              },
            }
          )
          .subscribe({
            next: async (response: any) => {
              localStorage.setItem('token', response.token)
              this.router.navigate(['home'])
            },
            error: async (err) => {
              console.log("err", err)
              this.router.navigate(['login']);
            },
          });
      }
    });
  }
}
