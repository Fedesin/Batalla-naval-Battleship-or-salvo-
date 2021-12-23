import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

import { HubConnection } from '@microsoft/signalr';
import * as signalR from '@microsoft/signalr';
import { GameView } from 'src/app/Interfaces/game-view';
import { Player } from 'src/app/Interfaces/player';
import { GameState } from 'src/app/Interfaces/game-state';

declare var $: any

interface message {
    avatar: string,
    name: string,
    message: string,
}

@Component({
    selector: 'app-game',
    templateUrl: './game.page.html',
    styleUrls: ['./game.page.scss'],
})

export class GamePage implements OnInit {

    id: string | null = null;

    gameView: GameView;

    static: any;

    salvoCount: number = 0;

    player: Player;

    opponent: Player;

    gameState: GameState;

    interval: any;

    disparar: boolean = true;

    grid: GridStack;

    token: String | null;

    state: String = "Cargando";

    selectGif: boolean = false;

    constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient, private navCtrl: NavController, private toastController: ToastController) { }

    ngOnInit(): void {

    }

    showGif() {
        this.selectGif = !this.selectGif;
    }

    public sendMessage(): void {
        if (this._hubConnection) {
            this._hubConnection.invoke('Chat', this.player.email, this.gameView.gameId, this.msg);
        }
        this.msg = "";
        this.showGif();
    }

    private _hubConnection: HubConnection | undefined;

    message = '';
    messages: message[] = [];
    msg: string;

    async presentToast(name: string, avatar: string, message: string) {
        const toast = await this.toastController.create({
            message: `
            <ion-item>
            <ion-avatar slot="start">
              <img src="${avatar}">
            </ion-avatar>
            <ion-label>${name}: ${message}</ion-label></ion-item>`,
            position: 'top',
            duration: 5000
        });
        toast.present();
    }

    ionViewWillEnter(): void {
        this.id = this.route.snapshot.paramMap.get('id');
        this.http.get(environment.apiUrl + "/gamePlayers/" + this.id, {
            headers: new HttpHeaders({
                "Content-Type": "application/json"
            })
        })
            .subscribe({
                next: (response: any) => {
                    this.gameView = response;
                    this.gameState = response.gameState;
                    this.static = this.gameView.ships && this.gameView.ships.length > 0;
                    this.getPlayers(this.gameView, this.id);
                    this.initializeGrid(this.gameView, this.static);
                    if (!this.static) {
                        this.addEventsShips();
                        this.placeShips(this.gameView.ships);
                    }
                    else
                        this.addEventsSalvo();
                    this.getGameData();

                    const options: signalR.IHttpConnectionOptions = {
                        accessTokenFactory: () => {
                            return localStorage.getItem("token");
                        }
                    };

                    this._hubConnection = new signalR.HubConnectionBuilder()
                        .withUrl(environment.apiUrl + '/chatHub', options)
                        .configureLogging(signalR.LogLevel.Information)
                        .build();

                    this._hubConnection.start().then(() => { this._hubConnection.invoke("SetGameGroup", this.player.email, this.gameView.gameId); }).catch(err => console.error(err.toString()));
                    this._hubConnection.on('Chat', (data: message, msg: string) => {
                        this.presentToast(data.name, data.avatar, msg); 
                    });
                },
                error: () => {
                    alert("Error al unirse al juego.");
                }
            });
    }

    getPlayers(gameView: any, gpId: any) {
        gameView.gamePlayers.forEach((gp: any) => {
            if (gp.id == gpId)
                this.player = gp.player;
            else
                this.opponent = gp.player;
        });
    }

    initializeGrid(gameview: any, staticf: any) {
        var options = {
            //grilla de 10 x 10
            column: 10,
            maxRow: 10,                                   // Maximum rows where zero means unlimited.
            minRow: 10,
            row: 10,
            //separacion entre elementos (les llaman widgets)
            verticalMargin: 0,
            //altura de las celdas
            cellHeight: "30",
            //desabilitando el resize de los widgets
            disableResize: true,
            //widgets flotantes
            float: true,
            //removeTimeout: 100,
            //permite que el widget ocupe mas de una columna
            disableOneColumnMode: true,
            //false permite mover, true impide
            staticGrid: staticf,
            //activa animaciones (cuando se suelta el elemento se ve más suave la caida)
            animate: true,
            alwaysShowResizeHandle: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        };

        $('.grid-stack').gridstack(options);

    }

    placeShips2() {
        this.disparar = false;
        var shipTypeAndCells = [];

        for (var i = 1; i <= 5; i++) {
            var shipLoc: any = new Object();
            var cellsArray = [];

            var h = parseInt($("#grid .grid-stack-item:nth-child(" + i + ")").attr("data-gs-height") || "");
            var w = parseInt($("#grid .grid-stack-item:nth-child(" + i + ")").attr("data-gs-width") || "");
            var posX = parseInt($("#grid .grid-stack-item:nth-child(" + i + ")").attr("data-gs-x") || "");
            var posY = parseInt($("#grid .grid-stack-item:nth-child(" + i + ")").attr("data-gs-y") || "") + 64;

            if (w > h) {
                for (var e = 1; e <= w; e++) {
                    var HHH = String.fromCharCode(posY + 1) + (posX + e);
                    cellsArray.push({ id: 0, location: HHH });
                    shipLoc.id = 0;
                    shipLoc.type = $("#grid .grid-stack-item:nth-child(" + i + ")").attr("id");
                    shipLoc.locations = cellsArray;
                }
            } else if (h > w) {
                for (var d = 1; d <= h; d++) {
                    var VVV = String.fromCharCode(posY + d) + (posX + 1);
                    cellsArray.push({ id: 0, location: VVV });
                    shipLoc.id = 0;
                    shipLoc.type = $("#grid .grid-stack-item:nth-child(" + i + ")").attr("id");
                    shipLoc.locations = cellsArray;
                }
            }
            shipTypeAndCells.push(shipLoc);
        }
        this.postShips(shipTypeAndCells);
    }

    postShips(shipTypeAndCells: any) {
        this.http.post(environment.apiUrl + '/gamePlayers/' + this.gameView.id + '/ships', shipTypeAndCells, {
            headers: new HttpHeaders({
                "Content-Type": "application/json"
            })
        }).subscribe({
            next: () => {
                this.ionViewWillEnter();
                this.disparar = true;
            },
            error: (err) => {
                this.disparar = true;
                alert(err.console.error);
            }
        });
    }

    placeShips(ships: any) {
        let grid = $('#grid').data('gridstack');
        ships = JSON.parse(JSON.stringify(ships));
        if (ships.length > 0) {
            ships.forEach((ship: any) => {
                ship.locations.sort((a: any, b: any) => {
                    if (a.location > b.location)
                        return 1;
                    else if (a.location < b.location)
                        return -1;
                    else
                        return 0;
                });

                var searchChar = ship.locations[0].location.slice(0, 1);
                var secondChar = ship.locations[1].location.slice(0, 1);
                if (searchChar === secondChar) {
                    ship.position = "Horizontal";
                } else {
                    ship.position = "Vertical";
                }
                for (var i = 0; i < ship.locations.length; i++) {
                    ship.locations[i].location = ship.locations[i].location.replace(/A/g, '0');
                    ship.locations[i].location = ship.locations[i].location.replace(/B/g, '1');
                    ship.locations[i].location = ship.locations[i].location.replace(/C/g, '2');
                    ship.locations[i].location = ship.locations[i].location.replace(/D/g, '3');
                    ship.locations[i].location = ship.locations[i].location.replace(/E/g, '4');
                    ship.locations[i].location = ship.locations[i].location.replace(/F/g, '5');
                    ship.locations[i].location = ship.locations[i].location.replace(/G/g, '6');
                    ship.locations[i].location = ship.locations[i].location.replace(/H/g, '7');
                    ship.locations[i].location = ship.locations[i].location.replace(/I/g, '8');
                    ship.locations[i].location = ship.locations[i].location.replace(/J/g, '9');
                }

                var yInGrid = parseInt(ship.locations[0].location.slice(0, 1));
                var xInGrid = parseInt(ship.locations[0].location.slice(1, 3)) - 1;

                if (ship.position === "Horizontal") {
                    grid.addWidget($('<div id="' + ship.type + '"><div class="grid-stack-item-content ' + ship.type + 'Horizontal"></div><div/>'),
                        xInGrid, yInGrid, ship.locations.length, 1, false);
                } else if (ship.position === "Vertical") {
                    grid.addWidget($('<div id="' + ship.type + '"><div class="grid-stack-item-content ' + ship.type + 'Vertical"></div><div/>'),
                        xInGrid, yInGrid, 1, ship.locations.length, false);
                }
            })
        }
        else {
            grid.addWidget($('<div id="PatroalBoat"><div class="grid-stack-item-content PatroalBoatHorizontal"></div><div/>'), 0, 0, 2, 1, false);
            grid.addWidget($('<div id="Destroyer"><div class="grid-stack-item-content DestroyerHorizontal"></div><div/>'), 0, 1, 3, 1, false);
            grid.addWidget($('<div id="Submarine"><div class="grid-stack-item-content SubmarineHorizontal"></div><div/>'), 0, 2, 3, 1, false);
            grid.addWidget($('<div id="BattleShip"><div class="grid-stack-item-content BattleShipHorizontal"></div><div/>'), 0, 3, 4, 1, false);
            grid.addWidget($('<div id="Carrier"><div class="grid-stack-item-content CarrierHorizontal"></div><div/>'), 0, 4, 5, 1, false);
        }
    }

    addEventsShips() {
        let grid = $('#grid').data('gridstack');
        $("#Carrier, #PatroalBoat, #Submarine, #Destroyer, #BattleShip").click(() => {
            var h = parseInt($(this).attr("data-gs-height") || "");
            var w = parseInt($(this).attr("data-gs-width") || "");
            var posX = parseInt($(this).attr("data-gs-x") || "");
            var posY = parseInt($(this).attr("data-gs-y") || "");

            if (w > h) {
                if (grid.isAreaEmpty(posX, posY + 1, h, w - 1) && posY + w <= 10) {
                    grid.update($(this), posX, posY, h, w);
                    $(this).children('.grid-stack-item-content').removeClass($(this).attr('id') + "Horizontal");
                    $(this).children('.grid-stack-item-content').addClass($(this).attr('id') + "Vertical");
                }
            } else {
                if (grid.isAreaEmpty(posX + 1, posY, h - 1, w) && posX + h <= 10) {
                    grid.update($(this), posX, posY, h, w);
                    $(this).children('.grid-stack-item-content').addClass($(this).attr('id') + "Horizontal");
                    $(this).children('.grid-stack-item-content').removeClass($(this).attr('id') + "Vertical");
                }
            }
        });
    }

    getGameData() {
        this.placeSalvos(this.gameView.salvos, this.player.id, this.gameView.ships, this.gameView.aguasOpponent);
        this.placeSinksShips(this.gameView.sunks, this.gameView.sunksOpponent);
        this.placeHits(this.gameView.hits);
        this.state = this.getGameState(this.gameView.gameState);
        if (this.gameView.gameState.toString() != 'WIN' || this.gameView.gameState.toString() != 'TIE' || this.gameView.gameState.toString() != 'LOSS') {
            if (this.interval == null)
                this.interval = setInterval(
                    () => {
                        this.http.get(`${environment.apiUrl}/gamePlayers/${this.id}`)
                            .subscribe({
                                next: (response: any) => {
                                    this.gameState = response.gameState;
                                    this.gameView = response;
                                    this.getGameData();
                                },
                                error: (err) => {
                                    alert("error: " + err.error);
                                }
                            });
                    }, 10000);
        }
        else {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    addEventsSalvo() {
        $(".salvo").click((btn: any) => {
            if (this.salvoCount < 5 && !$(btn.target).hasClass('shooted')) {
                if ($(btn.target).hasClass('shoot')) {
                    $(btn.target).removeClass('shoot');
                    this.salvoCount--;
                }
                else {
                    $(btn.target).addClass('shoot');
                    this.salvoCount++;
                }
            } else {
                if ($(btn.target).hasClass('shoot')) {
                    $(btn.target).removeClass('shoot');
                    this.salvoCount--;
                }
            }
        });
    }

    placeSalvosfront() {
        this.disparar = false;
        
        if (this.salvoCount == 5) {
            var cellsArray = [];
            $(".salvo.shoot").each(function () {
                cellsArray.push({ id: 0, location: $(this).attr("id") });
                $(this).removeClass('shoot');
                $(this).addClass('shooting');
            })
            var salvo: any = new Object();
            salvo.id = 0;
            salvo.turn = 0;
            salvo.locations = cellsArray;
            this.postSalvos(salvo);
        }
        else {
            alert("Fallas en los cañones\nDebe indicar las 5 posiciones de los salvos");
        }

        this.disparar = true;
        
    }

    postSalvos(salvos: any) {
        this.http.post(environment.apiUrl + '/gamePlayers/' + this.gameView.id + '/salvos', salvos, {
            headers: new HttpHeaders({
                "Content-Type": "application/json"
            })
        })
            .subscribe({
                next: (response) => {
                    this.salvoCount = 0;
                    this.disparar = true;
                },
                error: (err) => {
                    alert("error: " + err.error);
                }
            });
    }

    placeSalvos(salvos: any, playerId: any, ships: any, aguas: any) {
        $('.hitSelf').remove();
    
        $(".salvo.shooting").each(function () {
           
            $(this).removeClass('shooting');
           
        })
      
        salvos = JSON.parse(JSON.stringify(salvos));
      
        const shitPositions = [];
     
        ships.forEach(ship => ship.locations.forEach(location => { shitPositions.push(location.location) }))
    
      
        salvos.forEach(salvo => {
     
            if (salvo.player.id == playerId) {
    
            
                salvo.locations.forEach(location => {
                    if (!$('#' + location.location).hasClass("shooted")) {
                        $('#' + location.location).addClass("shooted");
                        $('#' + location.location).text(salvo.turn);
                    }
                })
            }
            else {
         
                salvo.locations.forEach(location => {
                    if (shitPositions.indexOf(location.location) != -1) {
                        location.location = location.location.replace(/A/g, '0');
                        location.location = location.location.replace(/B/g, '1');
                        location.location = location.location.replace(/C/g, '2');
                        location.location = location.location.replace(/D/g, '3');
                        location.location = location.location.replace(/E/g, '4');
                        location.location = location.location.replace(/F/g, '5');
                        location.location = location.location.replace(/G/g, '6');
                        location.location = location.location.replace(/H/g, '7');
                        location.location = location.location.replace(/I/g, '8');
                        location.location = location.location.replace(/J/g, '9');
    
                        var yInGrid = (parseInt(location.location.slice(0, 1)) * 40) + 42;
                        var xInGrid = ((parseInt(location.location.slice(1, 3)) - 1) * 40) + 42;
                        $('.grid-ships').append('<div class="hitSelf" style="top:' + yInGrid + 'px; left:' + xInGrid + 'px;" ></div>');
                    }
                })
            }
        })
    
    
        if(aguas!=null)
        aguas.forEach(agua => {
    
            if (aguas.indexOf(agua) != -1) {
                agua = agua.replace(/A/g, '0');
                agua = agua.replace(/B/g, '1');
                agua = agua.replace(/C/g, '2');
                agua = agua.replace(/D/g, '3');
                agua = agua.replace(/E/g, '4');
                agua = agua.replace(/F/g, '5');
                agua = agua.replace(/G/g, '6');
                agua = agua.replace(/H/g, '7');
                agua = agua.replace(/I/g, '8');
                agua = agua.replace(/J/g, '9');
    
                var yInGrid2 = (parseInt(agua.slice(0, 1)) * 40) + 42;
                var xInGrid2 = ((parseInt(agua.slice(1, 3)) - 1) * 40) + 42;
                $('.grid-ships').append('<div class="agua" style="top:' + yInGrid2 + 'px; left:' + xInGrid2 + 'px;" ></div>');
            }
        })
    }

    placeSinksShips(playerSunks: any, opponentSunks: any) {
        if (playerSunks != null)
            playerSunks.forEach(function (sunk: any) {
                $("#" + sunk + "Icon").attr("src", "assets/img/" + sunk.toLowerCase() + "sunk.png");
            })
        if (opponentSunks != null)
            opponentSunks.forEach(function (sunk: any) {
                $("#Opponent" + sunk + "Icon").attr("src", "assets/img/" + sunk.toLowerCase() + "sunk.png");
            })
    }

    placeHits(playerHits: any) {
        playerHits.forEach(function (playerHit) {
            if (playerHit.hits != null)
                playerHit.hits.forEach(function (hit) {
                    hit.hits.forEach(function (hitCell) {
                        $("#" + hitCell).addClass("hitOpponent");
                    })
                })
        })
    }

    getGameState(gameState: any): string {
        var state = "";
        switch (gameState) {
            case 'ENTER_SALVO':
                state = 'Capitán, dispare las salvas'
                break;
            case 'PLACE_SHIPS':
                state = 'Capitán, posicione los barcos'
                break;
            case 'WAIT':
                state = 'Capitán, debe esperar la recarga de las armas'
                break;
            case 'WIN':
                state = 'Capitán, ha ganado la batalla'
                break;
            case 'LOSS':
                state = 'Capitán, ha perdido la batalla'
                break;
            case 'TIE':
                state = 'Capitán, ha empatado'
                break;
            case 'WAIT_PLAYER':
                state = 'Esperando un contrincante'
                break;
        }
        return state;
    }



}
