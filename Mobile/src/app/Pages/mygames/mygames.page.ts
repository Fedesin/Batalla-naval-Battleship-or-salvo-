import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ActionSheetController, NavController } from '@ionic/angular';
import { GameList, GameListResponse } from 'src/app/Interfaces/game-list';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-mygames',
  templateUrl: './mygames.page.html',
  styleUrls: ['./mygames.page.scss'],
})
export class MygamesPage implements OnInit {
  token: string | null = null;

  data: GameListResponse;

  email: string | null = null;

  tokenInfo: any;

  constructor(private http: HttpClient, private navCtrl: NavController, private actionSheetController: ActionSheetController,
    private jwtHelper: JwtHelperService) { }

  ngOnInit() {
    this.token = localStorage.getItem("token");
    this.tokenInfo = this.jwtHelper.decodeToken(localStorage.getItem("token"));
    this.email = this.tokenInfo["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
    this.http.get(environment.apiUrl + "/games/mygames", {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Access-Control-Allow-Headers": "Content-Type",
        "Authorization": `Bearer ${this.token}`,
      },
    })
      .subscribe({
        next: (response: GameListResponse) => {
          this.data = response;
        },
        error: (err) => {
        }
      });
  }

  updateData(event: any) {
    this.ngOnInit();
    event.target.complete();
  }

  async returngame(id: number) {
    const actionSheet = await this.actionSheetController.create({
      header: '¿Desea crear una nueva partida?',
      buttons: [{
        text: 'Retornar al juego',
        icon: 'add',
        handler: () => {
          this.navCtrl.navigateRoot('games/' + id, { animated: true, animationDirection: 'forward' });
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
