const apiUrl = "https://api.g2csolutions.tech"
const urlParams = new URLSearchParams(window.location.search);
const pageUrl = urlParams.get('page');

var app = new Vue({
    el: '#app',
    data: {
        sesion: 0,
        page: pageUrl == null? 1 : pageUrl,
        pagem: 0,
        totalPages: 0,
        totalPagesm: 0,
        itemsPages: 0,
        games: [],
        mygames: [],
        scores: [],
        name: "",
        email: "",
        password: "",
        emailr: "",
        passwordr: "",
        token: null,
        newpassword: "",
        confirmpassword: "",
        emailForPass: "",
        modal: {
            tittle: "",
            message: ""
        },
        player: null,
        music: new Audio('audio/musica-fondo.mp3')
    },
    mounted() { 
        this.token = localStorage.getItem("token");
        if(this.token != null) {
            if (Date.now() >= JSON.parse(atob(this.token.split('.')[1])).exp * 1000) {
                this.token = null;
                localStorage.removeItem("token");
            }else {
                axios.post(apiUrl+'/auth/verify',{}, {
                    headers: {
                        Authorization: "Bearer " + this.token
                      }
                })
                .then(response => {
                    localStorage.setItem("token", response.data.token);
                    this.token = response.data.token;
                    let tokenInfo = JSON.parse(atob(this.token.split('.')[1]));
                    this.name = tokenInfo["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
                    this.email = tokenInfo["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"]
                    this.showLogin(false);
                    this.getMyGames();
                    this.getMyGames();
                })
                .catch(() => {
                    localStorage.removeItem("token");
                    this.showLogin(true);
                });
                
            }           
        }
        else{
            this.showLogin(true);
            this.player = "Guest"
        }
        this.getGames();
        this.getScores();
        var modal = getQueryVariable('modal');
        if (modal === 'confirmemail') {
            this.confirmEmail();
        }
        else if (modal === 'resetpassword') {
            $("#resetpassword").modal('show');
        }
    },
    methods: {
        getMusicaFondo: function() {
            this.music.volume = 0.5;
            //this.music.play();
            this.music.loop = true;
        
        },
        joinGame(gId) {
            var gpId = null;
            axios.post(apiUrl+'/games/' + gId + '/players',{}, {
                headers: {
                    Authorization: "Bearer " + this.token
                  }
            })
                .then(response => {
                    gpId = response.data;
                    window.location.href = '/game.html?gp=' + gpId;
                })
                .catch(error => {
                    alert("erro al unirse al juego");
                });
        },
        createGame() {
            var gpId = null;
            axios.post(apiUrl+'/games/', {}, {
                headers: {
                    Authorization: "Bearer " + this.token
                  }
            })
                .then(response => {
                    gpId = response.data;
                    window.location.href = '/game.html?gp=' + gpId;
                })
                .catch(error => {
                    alert("erro al obtener los datos");
                });
        },
        returnGame(gpId) {
            window.location.href = '/game.html?gp=' + gpId;
        },
        getGames: function () {
            let header;
            if(this.token == null)
            {
                header = {}
                
            }
            else {
                header = {
                    headers: {
                        Authorization: "Bearer " + this.token
                      }
                }
            }
            axios.get(apiUrl+'/games?page='+this.page, header)
                .then(response => {
                    this.player = response.data.email;
                    this.games = response.data.games;
                    this.page = response.data.page;
                    this.totalPages = response.data.totalPage;
                    this.itemsPages = response.data.itemPerPage;
                    
                    if (this.name != "") {
                        
                        sesion = 1;
                        swal("Bienvenido", "Que bueno volver a verte " + this.name);
                        //this.modal.tittle = "Información";
                        //this.modal.message = "Bienvenido " + this.name;
                        /*this.showModal(true);*/
                        this.showModal2(false);
                    }
                })
                .catch(error => {
                    swal("Algo salió mal!", "erro al obtener los datos", "error");
                    /*alert("erro al obtener los datos");*/
                });
        },
        getGamesPage: function(page){
            let header;
            if(this.token == null)
            {
                header = {}
                
            }
            else {
                header = {
                    headers: {
                        Authorization: "Bearer " + this.token
                      }
                }
            }
            axios.get(apiUrl+'/games?page='+page, header)
            .then(response => {
                this.player = response.data.email;
                this.games = response.data.games;
                this.page = response.data.page;
                this.totalPages = response.data.totalPage;
                this.itemsPages = response.data.itemPerPage;
                
                if (this.name != "") {
                    
                    sesion = 1;
                    this.showModal2(false);
                }
            })
            .catch(error => {
                swal("Algo salió mal!", "erro al obtener los datos", "error");
                /*alert("erro al obtener los datos");*/
            });
        },
        getMyGames: function(page){
            if(page == undefined)
                page = 1;
            let header;
            if(this.token == null)
            {
                header = {}
                
            }
            else {
                header = {
                    headers: {
                        Authorization: "Bearer " + this.token
                      }
                }
            }
            axios.get(apiUrl+'/games/mygames?page='+page, header)
            .then(response => {
                this.mygames = response.data.games;
                this.totalPagesm = response.data.totalPage;
                this.pagem = response.data.page;
            })
            .catch(error => {
                swal("Algo salió mal!", "erro al obtener los datos", "error");
                /*alert("erro al obtener los datos");*/
            });
        },
        playerInfo: function(){
            window.location.href = '/player.html?email=' +this.player;
        },

        showModal: function (show) {
            if (show)
                $("#infoModal").modal('show');
            else
                $("#infoModal").modal('hide');
        },
        showModal2: function (show) {
            this.getMusicaFondo();
            if (show)
                $("#registerModal").modal('show');
            else
                $("#registerModal").modal('hide');
                
        },
        showLogin: function (show) {
            if (show) {
                $("#login-form").show();
                $("#login-form").trigger("reset");
                this.email = "";
                this.password = "";
                this.name = ""
            }
            else
                $("#login-form").hide();
        },
        logout: function () {
            localStorage.removeItem("token");
            this.token = null;
            this.showLogin(true);
            this.getGames();
            this.email = "";
            this.password = "";
            this.modal.tittle = "Sesión Cerrada";
            this.modal.message = "Vuelve pronto " + this.name;
            this.showModal(true);
        },
        login: function (event) {
            //this.getMusicaFondo();
            if (this.email == "") {
                this.email = this.emailr;
                this.password = this.passwordr;
            }
            axios.post(apiUrl+'/auth/login', {
                email: this.email, password: this.password
            })
                .then(result => {
                    if (result.status == 200) {
                        localStorage.setItem("token", result.data.token);
                        this.token = localStorage.getItem("token");
                        let tokenInfo = JSON.parse(atob(this.token.split('.')[1]));
                        this.name = tokenInfo["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
                        this.email = tokenInfo["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"]
                        this.showLogin(false);
                        this.getGames();
                        this.getMyGames();
                        this.getMusicaFondo();
                    }
                })
                .catch(error => {
                    if (error.response.status == 401) {
                    	  swal("Falló el registro", error.response.data, "warning");
                        //this.modal.tittle = "Fallo en la autenticacion";
                        //this.modal.message = "Email o contraseña inválido"
                        //this.showModal(true);
                    }
                    else {
                        swal("Fallo la autenticación", "Ha ocurrido un error", "error");
                        //this.modal.tittle = "Fallo en la autenticacion";
                        //this.modal.message = "Ha ocurrido un error";
                        //this.showModal(true);
                    }
                });
        },
        signin: function (event) {
            axios.post(apiUrl+'/auth/register', {
                name: this.name, email: this.emailr, password: this.passwordr
            })
                .then(result => {
                    if (result.status == 201) {
                        localStorage.setItem("token", result.data.token);
                        this.token = localStorage.getItem("token");
                        let tokenInfo = JSON.parse(atob(this.token.split('.')[1]));
                        this.name = tokenInfo["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
                        this.email = tokenInfo["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"]
                        this.showLogin(false);
                        this.getGames();
                        this.getMusicaFondo();
                        this.modal.tittle = "Registro Existoso";
                        this.modal.message = "Por favor valida tu email";
                        this.showModal(true);
                    }
                })
                .catch(error => {
                    console.log(error.response)
                    console.log("error, código de estatus: " + error.response.status);
                    if (error.response.status == 403) {
                        swal("Falló el registro", error.response.data, "warning");
                        //this.modal.tittle = "Falló el registro";
                        //this.modal.message = error.response.data
                        //this.showModal(true);
                    }
                    else {
                        this.modal.tittle = "Fallo en la autenticacion";
                        this.modal.message = error.response.data;
                        this.showModal(true);
                    }
                });
        },
        forgetPassword: function (event) {
            axios.get(apiUrl +'/auth/forgetpassword' + '?email=' + this.emailForPass)
                .then(result => {
                    if (result.status == 200) {
                        $("#forgetpassword").modal("hide");
                        this.modal.tittle = "Recuperar contraseña";
                        this.modal.message = "Dirígase a su dirección de correo electrónico";
                        this.showModal(true);
                    }
                })
                .catch(error => {
                    if (error.response.status == 401) {
                        this.modal.tittle = "Recuperar contraseña";
                        this.modal.message = error.response.data.message;
                        this.showModal(true);
                    }
                    else {
                        this.modal.tittle = "Recuperar contraseña";
                        this.modal.message = "Ha ocurrido un error. Inténtelo de nuevo mas tarde";
                        this.showModal(true);
                    }
                });
        },
        resetPassword: function (event) {
            var email = getQueryVariable('email').replace('%40','@');
            var token = getQueryVariable('token');
            axios.post(apiUrl +'/auth/resetpassword', {
                token: token, email: email, newpassword: this.newpassword, confirmpassword: this.confirmpassword
            })
                .then(result => {
                    if (result.status == 200) {
                        $("#resetpassword").modal("hide");
                        this.modal.tittle = "Recuperar contraseña";
                        this.modal.message = "La contraseña se ha actualizado correctamente. Inicie sesion.";
                        this.showModal(true);
                    }
                })
                .catch(error => {
                    if (error.response.status == 400) {
                        this.modal.tittle = "Recuperar contraseña";
                        this.modal.message = error.response.data.message;
                        this.showModal(true);
                    }
                    else {
                        this.modal.tittle = "Recuperar contraseña";
                        this.modal.message = "Ha ocurrido un error. No se pudo actualizar la contraseña";
                        this.showModal(true);
                    }
                });
        },
        confirmEmail: function () {
            axios.get(apiUrl +'/auth/confirmemail' + "?userid=" + getQueryVariable('userid') + "&token=" + getQueryVariable('token'))
                .then(response => {
                    this.modal.tittle = "Confirmar email";
                    this.modal.message = "Tu email ha sido confirmado";
                    this.showModal(true);
                })
                .catch(error => {
                    if (error.response.status == 401) {
                        this.modal.tittle = "Confirmar email";
                        this.modal.message = error.response.data.message;
                        this.showModal(true);
                    }
                    else {
                        this.modal.tittle = "Confirmar email";
                        this.modal.message = "Ha ocurrido un error. No se pudo confirmar el mail, inténtelo de nuevo mas tarde.";
                        this.showModal(true);
                    }

                });
        },
        getScores: function () {
            var scores = [];
            axios.get(apiUrl+'/games/scores')
            .then(response =>{
                this.scores = response.data;
            })
            /*
            scores.forEach(score => {
                game.gamePlayers.forEach(gp => {
                    var index = scores.findIndex(sc => sc.name == gp.player.name)
                    if (index < 0) {
                        var score = { name: gp.player.name, win: 0, tie: 0, lost: 0, total: 0 }
                        switch (gp.point) {
                            case 1:
                                score.win++;
                                break;
                            case 0:
                                score.lost++;
                                break;
                            case 0.5:
                                score.tie++;
                                break;
                        }
                        score.total += gp.point;
                        scores.push(score);
                    }
                    else {
                        switch (gp.point) {
                            case 1:
                                scores[index].win++;
                                break;
                            case 0:
                                scores[index].lost++;
                                break;
                            case 0.5:
                                scores[index].tie++;
                                break;
                        }
                        scores[index].total += gp.point;
                    }
                })
            })
            var scoresOrdenados = scores.sort((a, b) => {
                return b.total - a.total;
            });
            app.scores = scoresOrdenados;*/
        }
    },
    filters: {
        dateFormat(date) {
            return moment(date).format('LLL');
        }
    }
    
    
})

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (let i = 0; i < vars.length; i++) {
        let pair = vars[i].split("=");
        if (pair[0].toUpperCase() == variable.toUpperCase()) {
            return pair[1];
        }
    }
    return null;
}

setTimeout(function(){
    $('.loader_bg').fadeToggle();
}, 1500);


 