import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ActionSheetController, IonInfiniteScroll, LoadingController, NavController } from '@ionic/angular';
import { GameList, GameListResponse } from 'src/app/Interfaces/game-list';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  constructor(
    private actionSheetController: ActionSheetController, 
    private http: HttpClient, 
    private jwtHelper: JwtHelperService, 
    private router: Router, 
    private loadingController: LoadingController, 
    private navCtrl: NavController) { }

  token: string | null = null;

  data: GameListResponse;

  email: string | null = null;

  async ngOnInit() {
    const loading = await this.loadingController.create({
      message: 'Cargando Juegos...',
    });
    loading.present();
    this.token = localStorage.getItem("token")
    if (this.token == null) return;
    this.email = this.jwtHelper.decodeToken(this.token?.toString())?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
    this.http.get(environment.apiUrl + "/games", {
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

  updateData(event: any) {
    this.ngOnInit();
    event.target.complete();
  }
  
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  loadData(event) {
    if (this.data.page == this.data.totalPage) {
      event.target.complete();
      return;
    }
    else {
      this.http.get(`${environment.apiUrl}/games?page=${this.data.page + 1}`, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Access-Control-Allow-Headers": "Content-Type",
          "Authorization": `Bearer ${this.token}`,
        },
      })
        .subscribe({
          next: (response: any) => {
            this.data.page = response.page;
            for (var i = 0; i < response.games.length; i++) {
              this.data.games.push(response.games[i]);
            }
          },
          error: (err) => {
            console.log(err);
          }
        });
    }
    event.target.complete();
  }

  async joinGame(id: number) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Unirse al juego',
      buttons: [{
        text: 'Unirse',
        icon: 'add',
        handler: () => {
          this.http.post(environment.apiUrl + "/games/" + id + "/players", {
            headers: new HttpHeaders({
              "Content-Type": "application/json"
            })
          })
            .subscribe({
              next: (response: any) => {
                this.router.navigate(["/games/" + response]);
              },
              error: (err) => {
                alert(err.error);
              }
            });
        }
      },
      {
        text: 'Cancelar',
        icon: 'close'
      }]
    });
    await actionSheet.present();

    await actionSheet.onDidDismiss();
  }

  async creategame() {
    const actionSheet = await this.actionSheetController.create({
      header: '¿Desea crear una nueva partida?',
      buttons: [{
        text: 'Crear juego',
        icon: 'add',
        handler: () => {
          this.http.post(environment.apiUrl + "/games", {
            headers: new HttpHeaders({
              "Content-Type": "application/json"
            })
          })
            .subscribe({
              next: (response: any) => {
                this.navCtrl.navigateRoot("games/" + response, { animated: true, animationDirection: 'forward' });
              },
              error: (err) => {
                alert(err.error);
              }
            });
        }
      },
      {
        text: 'Cancelar',
        icon: 'close',
      }]
    });
    await actionSheet.present();

    await actionSheet.onDidDismiss();
  }

  getState(state: number): string {
    let returnState: string = "Error";
    switch (state) {
      case 0:
        {
          returnState = "Listo para disparar."
          break;
        }
      case 1:
        {
          returnState = "Debe posicionar los barcos."
          break;
        }
      case 2:
        {
          returnState = "Esperando que el enemigo dispare."
          break;
        }
      case 3:
        {
          returnState = "Gano."
          break;
        }
      case 4:
        {
          returnState = "Perdio."
          break;
        }
      case 5:
        {
          returnState = "Empato."
          break;
        }
      case 6:
        {
          returnState = "Esperando Oponente."
          break;
        }
      case 7:
        {
          returnState = "Esperando que el oponente posicione los barcos."
          break;
        }
        case 8:
        {
          returnState = "Jugando."
          break;
        }
        case 9:
        {
          returnState = "Terminado."
          break;
        }
    }

    return returnState;
  }

}
