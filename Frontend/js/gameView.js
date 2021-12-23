const urlParams = new URLSearchParams(window.location.search);
const gpId = urlParams.get('gp');
const apiUrl = "https://api.g2csolutions.tech"

var app = new Vue({
    el: '#app',
    data: {
        gameView: {},
        player: { email: null, name: null, avatar: null},
        opponent: { email: null, name: null, avatar: null },
        salvoCount: 0,
        gameState: '',
        interval: null,
        token: null,
    },
    mounted() {
     
        this.token = localStorage.getItem("token");
        if(this.token == null) {
            window.location.href = "/";
        }
   
        axios.get(apiUrl+'/gamePlayers/'+gpId, {
            headers: {
                Authorization: "Bearer " + this.token
              }
        })
            .then(response => {
            
                this.gameView = response.data;
                this.gameState = response.data.state;
           
                var static = this.gameView.ships && this.gameView.ships.length > 0;
        
                getPlayers(this.gameView, gpId);
          
                initializeGrid(this.gameView,static);
        
                placeShips(this.gameView.ships);
       
                if (!static)
                    addEventsShips();
                else
                    addEventsSalvo();
                
          
                this.getGameData();
                
            })
            .catch(error => {
                swal("Algo malio sal!", "error al obtener los datos del juego", "error");
            })
    },
    methods: {
        getGameData: function () {
            

            if(this.gameState != 'PLACE_SHIPS' && this.gameState != 'WAIT_PLAYER'){
       
                placeSalvos(this.gameView.salvos, this.player.id, this.gameView.ships, this.gameView.aguasOpponent);
     
            }
  
            placeSinksShips(this.gameView.sunks, this.gameView.sunksOpponent);

            placeHits(this.gameView.hits);
    
            this.gameState = getGameState(this.gameView.gameState);
   
            if (this.gameView.gameState == 'WAIT' || this.gameView.gameState == 'WAIT_PLAYER' || this.gameView.gameState == 'WAIT_PLAYER_SHIPS') {
           
                if (this.interval == null)
                    this.interval = setInterval(this.refresh, 12000);
                 
            }
            else {
  
                clearInterval(this.interval);
     
                this.interval = null;
   
            }
        },
        refresh: function () {
            axios.get(apiUrl+'/gamePlayers/' + gpId, {
                headers: {
                    Authorization: "Bearer " + this.token
                  }
            })
                .then(response => {
                    this.gameView = response.data;
                    getPlayers(this.gameView, gpId);
                    
                    this.getGameData();
                });
        },
        logout: function () {
            localStorage.removeItem("token");
            this.token = null;
            swal("Vuelve pronto!", "Sesión cerrada correctamente", "info");
            setTimeout(function () {
                window.location.replace('/index.html');
            }, 5000);
            //swal("Algo salio mal!", "Ocurrió un error al cerrar sesión","error");
        },
        placeShips: function () {
            var shipTypeAndCells = [];

            for (var i = 1; i <= 5; i++) {
                var shipLoc = new Object();
                var cellsArray = [];

                var h = parseInt($("#grid .grid-stack-item:nth-child(" + i + ")").attr("data-gs-height"));
                var w = parseInt($("#grid .grid-stack-item:nth-child(" + i + ")").attr("data-gs-width"));
                var posX = parseInt($("#grid .grid-stack-item:nth-child(" + i + ")").attr("data-gs-x"));
                var posY = parseInt($("#grid .grid-stack-item:nth-child(" + i + ")").attr("data-gs-y")) + 64;

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
        },
        postShips: function (shipTypeAndCells) {
            axios.post(apiUrl+'/gamePlayers/' + this.gameView.id + '/ships', shipTypeAndCells, {
                headers: {
                    Authorization: "Bearer " + this.token
                  }
            })
                .then(response => {
                    window.location.reload();
                })
                .catch(error => {
                    swal("Algo salio mal!", error.response.data, "error");
                });
        },
        placeSalvos: function () {
            
            if (this.salvoCount == 5) {
                var cellsArray = [];
                $(".salvo.shoot").each(function () {
                    cellsArray.push({ id: 0, location: $(this).attr("id") });
                    $(this).removeClass('shoot'); //esta linea de codigo arregla el bug de los tiros infinitos
                    $(this).addClass('shooting');
                })
                var salvo = new Object();
                salvo.id = 0;
                salvo.turn = 0;
                salvo.locations = cellsArray;
                this.postSalvos(salvo);
            }
            else {
                swal("Fallas en los cañones", "Debe indicar las 5 posiciones de los salvos", "warning");
            }
        },
        postSalvos: function (salvos) {
            axios.post(apiUrl+'/gamePlayers/' + this.gameView.id + '/salvos', salvos, {
                headers: {
                    Authorization: "Bearer " + this.token
                  }
            })
                .then(response => {
                    app.salvoCount = 0;
                    app.refresh();
                })
                .catch(error => {
                    swal("Algo malio sal!", error.response.data, "info");
                });
        },
        volver: function(){
            window.location.replace("/index.html");
        }
    }
})

function getPlayers(gameView,gpId) {
    gameView.gamePlayers.forEach(gp => {
        if (gp.id == gpId)
            app.player = gp.player;
        else
            app.opponent = gp.player;
    });
}

function initializeGrid(gameview, static) {
   
    var options = {
        //grilla de 10 x 10
        width: 10,
        height: 10,
        //separacion entre elementos (les llaman widgets)
        verticalMargin: 0,
        //altura de las celdas
        cellHeight: 40,
        //desabilitando el resize de los widgets
        disableResize: true,
        //widgets flotantes
        float: true,
        //removeTimeout: 100,
        //permite que el widget ocupe mas de una columna
        disableOneColumnMode: true,
        //false permite mover, true impide
        staticGrid: static,
        //activa animaciones (cuando se suelta el elemento se ve más suave la caida)
        
        animate: true
    }
    
    //se inicializa el grid con las opciones
    
    $('.grid-stack').gridstack(options);
   
}

function placeShips(ships) {
    grid = $('#grid').data('gridstack');
    ships = JSON.parse(JSON.stringify(ships));
    if (ships.length > 0) {
        ships.forEach(ship => {
            ship.locations.sort((a, b) => {
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

function placeSalvos(salvos, playerId, ships, aguas) {
    
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

function addEventsShips() {
    $("#Carrier, #PatroalBoat, #Submarine, #Destroyer, #BattleShip").click(function () {
        var h = parseInt($(this).attr("data-gs-height"));
        var w = parseInt($(this).attr("data-gs-width"));
        var posX = parseInt($(this).attr("data-gs-x"));
        var posY = parseInt($(this).attr("data-gs-y"));

        if (w > h) {
            if (grid.isAreaEmpty(posX, posY + 1, h, w - 1) && posY + w <= 10) {
                grid.update($(this), posX, posY, h, w);
                $(this).children('.grid-stack-item-content').removeClass($(this).attr('id') + "Horizontal");
                $(this).children('.grid-stack-item-content').addClass($(this).attr('id') + "Vertical");
            }
        } else {
            if (grid.isAreaEmpty(posX + 1, posY, h - 1 , w) && posX + h <= 10) {
                grid.update($(this), posX, posY, h, w);
                $(this).children('.grid-stack-item-content').addClass($(this).attr('id') + "Horizontal");
                $(this).children('.grid-stack-item-content').removeClass($(this).attr('id') + "Vertical");
            }
        }
    });
}

function addEventsSalvo() {
    $(".salvo").click(function () {
        if (app.salvoCount < 5 && !$(this).hasClass('shooted')) {
            if ($(this).hasClass('shoot')) {
                $(this).removeClass('shoot');
                app.salvoCount--;
            }
            else {
                $(this).addClass('shoot');
                app.salvoCount++;
            }
        } else {
            if ($(this).hasClass('shoot')) {
                $(this).removeClass('shoot');
                app.salvoCount--;
            }
        }
    });
}

function placeHits(playerHits) {
    playerHits.forEach(function (playerHit) {
        if (playerHit.hits != null)
            playerHit.hits.forEach(function (hit) {
                hit.hits.forEach(function (hitCell) {
                    $("#" + hitCell).addClass("hitOpponent");
                })
            })
    })
}

function placeSinksShips(playerSunks, opponentSunks) {
    
    if (playerSunks != null)
        playerSunks.forEach(function (sunk) {
            $("#" + sunk + "Icon").attr("src", "img/" + sunk.toLowerCase() +"sunk.png");
        })
    if (opponentSunks != null)
        opponentSunks.forEach(function (sunk) {
            $("#Opponent" + sunk + "Icon").attr("src", "img/" + sunk.toLowerCase() + "sunk.png");
        })
}

function getGameState(gameState) {
    
    var state = "";
    switch (gameState) {
        case 'ENTER_SALVO':
            state = 'Capitán, dispare las salvas';
            swal("Preparados para continuar", "Armas recargadas", "info");
            break;
        case 'PLACE_SHIPS':
            state = 'Capitán, posicione los barcos'
            swal("Que comience el juego!", "Elija bien las posiciones de sus tropas");
            break;
        case 'WAIT':
            state = 'Capitán, debe esperar la recarga de las armas'
            swal("Esperando respuesta enemiga", "", "info");
            break;
        case 'WIN':
            state = 'Capitán, ha ganado la batalla';
            this.getAudio("audio/gane.mp3", 0.3);
            swal({
                title: "Felicidades!",
                text: "Ha ganado la partida",
                icon: "success",
                button: "Genial!",
            });
            break;
        case 'LOSS':
            state = 'Capitán, ha perdido la batalla';
            this.getAudio("audio/perdi.mp3", 0.3);
            swal("YOU LOSE", "Quizas en otra oportunidad.", "info");
            break;
        case 'TIE':
            state = 'Capitán, ha empatado';
            this.getAudio("audio/empate.mp3", 0.3);
            swal("Empate?", "Que final mas aburrido", "info");
            break;
        case 'WAIT_PLAYER':
            state = 'Esperando un contrincante'
            swal("Paciencia", "Ya llegara alguien con quien jugar", "info");
            break;
        case 'WAIT_PLAYER_SHIPS':
            state = 'Esperando el posicionamiento de los barcos enemigos'
            swal("Paciencia", "No todos somos igual de rapidos", "info");
            break;
    }
    return state;
}

function getAudio(audio, vol) {
    const hitSound = new Audio(audio);
    hitSound.volume = vol;
    hitSound.play();
    hitSound.loop = false;
};
