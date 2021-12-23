import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { LoadingController } from '@ionic/angular';
import { Ranking } from 'src/app/Interfaces/ranking';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.page.html',
  styleUrls: ['./ranking.page.scss'],
})
export class RankingPage implements OnInit {

  token: string | null;

  email: string;

  data: Ranking;

  constructor(private loadingController: LoadingController, private jwtHelper: JwtHelperService, private http: HttpClient) { }

  async ngOnInit() {
    const loading = await this.loadingController.create({
      message: 'Cargando Juegos...',
    });
    loading.present();
    this.token = localStorage.getItem("token")
    if (this.token == null) return;
    this.http.get(environment.apiUrl + "/games/scores", {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Access-Control-Allow-Headers": "Content-Type",
        "Authorization": `Bearer ${this.token}`,
      },
    })
      .subscribe({
        next: (response: any) => {
          this.data = response;
        },
        error: (err) => {
          console.log(err);
        }
      });
    loading.dismiss();
  }

}
