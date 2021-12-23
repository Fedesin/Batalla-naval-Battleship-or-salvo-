const apiUrl = "http://54.207.73.39";
const url = "https://api.g2csolutions.tech";
const urlParams = new URLSearchParams(window.location.search);
const email = urlParams.get("email");

var app = new Vue({
  el: "#app",
  data: {
    player: {},
    name: "",
    password: "",
    newpassword1: "",
    newpassword2: "",
    avatar: "",
    mail: "",
    token: "",
    image: "",
    ganadas: "",
    empatadas: "",
    jugadas: "",
    winrate: 100
  },
  mounted() {
    this.token = localStorage.getItem("token");
    this.getPlayer();
  },
  methods: {
    onFileChange(e) {
      var files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;
      this.createImage(files[0]);
    },
    createImage(file) {
      var image = new Image();
      var reader = new FileReader();
      var vm = this;

      reader.onload = (e) => {
        vm.image = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    removeImage: function (e) {
      this.image = "";
    },
    uploadFile(event) {
      var formData = new FormData();
      var imagefile = document.querySelector("#file");
      formData.append("photo", imagefile.files[0]);
      axios
        .post(url + "/profile/update/avatar", formData, {
          headers: {
            Authorization: "Bearer " + this.token,
            "Content-Type": "multipart/form-data",
          },
        })
        .then((result) => {
          swal("Exito!", "Foto actualizada correctamente", "success");
          setTimeout(function () {
            window.location.reload();
            }, 2000);
        })
        .catch((error) => {
          swal("Algo malio sal!", "Error al subir la foto", "error");
        });
    },
    getPlayer() {
      let header;
      if (this.token == null) {
        header = {};
      } else {
        header = {
          headers: {
            Authorization: "Bearer " + this.token,
          },
        };
      }
      axios
        .get(url + "/profile", header)
        .then((response) => {
          this.player = response.data;
          this.name = response.data.name;
          this.jugadas = response.data.jugadas;
          this.ganadas = response.data.ganadas;
          this.empatadas = response.data.empatadas;
          this.avatar = this.player.avatar;
          if(this.player.jugadas != 0)
            this.winrate = this.player.ganadas * 100 / this.player.jugadas

            this.winrate = this.winrate.toFixed(2);
        })
        
        .catch((error) => {
          swal(
            "Algo malio sal!",
            "error al obtener los datos del jugador",
            error.data
          );
        });
    },
    updatePlayer() {
      let header;
      if (this.token == null) {
        header = {};
      } else {
        header = {
          headers: {
            Authorization: "Bearer " + this.token,
          },
        };
      }
      this.name = user.value;
      this.password = oldpassword.value == "" ? "" : oldpassword.value;
      this.newpassword1 = newpassword1.value == "" ? "" : newpassword1.value;
      this.newpassword2 = newpassword2.value == "" ? "" : newpassword2.value;
      if (this.newpassword1 != this.newpassword2)
        return swal(
          "Error en password",
          "Las contraseñas no coinciden!",
          "warning"
        );
      if (this.name == "" && this.password == "" && this.newpassword1 == "")
        return swal(
          "Aqui no paso nada!",
          "No se realizo ningun cambio...",
          "info"
        );

      let Name = this.name;
      let OldPassword = this.password;
      let Password = this.newpassword1;
      axios.put(url+"/profile/update",
          {
            Name,
            OldPassword,
            Password,
          },
          header
        )
        .then((result) => {
          swal(
            "Actualizacion!",
            "Información actualizada correctamente",
            "success"
          );
        })
        .catch((error) => {
          swal(
            "Error al actualizar los datos",
            "Algo malio sal!, " + error.response,
            "error"
          );
        });
        setTimeout(function () {
            window.location.reload();
        }, 2000);
    },
    updateAvatar: function () {
      let header;
      if (this.token == null) {
        header = {};
      } else {
        header = {
          headers: {
            Authorization: "Bearer " + this.token,
          },
        };
      }
      let photo = foto.value;
      axios
        .post(
          url + "/profile/update/avatar",
          {
            photo,
          },
          header
        )
        .then((result) => {
          swal("Exito!", "Foto actualizada correctamente", "success");
        })
        .catch((error) => {
          swal("Algo malio sal!", "Error al subir la foto", "error");
        });
    },
    selectavatar: function (avatar) {
      let header;
      if (this.token == null) {
        header = {};
      } else {
        header = {
          headers: {
            Authorization: "Bearer " + this.token,
          },
        };
      }
      let id;
      switch(avatar){
        case 'avatar': 
            this.avatar = 'https://res.cloudinary.com/dwu2fgi1k/image/upload/v1639879192/profile/avatars/default0.png'; 
            id= 0;
          break;
        case 'avatar2': this.avatar = 'https://res.cloudinary.com/dwu2fgi1k/image/upload/v1639879192/profile/avatars/default2.png';
        id= 2;
        break;
          case 'avatar3': this.avatar = 'https://res.cloudinary.com/dwu2fgi1k/image/upload/v1639879192/profile/avatars/default3.png';
          id= 3;
          break;
          case 'avatar4': this.avatar = 'https://res.cloudinary.com/dwu2fgi1k/image/upload/v1639879192/profile/avatars/default4.png';
          id= 4;
          break;
          case 'avatar5': this.avatar = 'https://res.cloudinary.com/dwu2fgi1k/image/upload/v1639879192/profile/avatars/default5.png';
          id= 5;
          break;
          case 'avatar6': this.avatar = 'https://res.cloudinary.com/dwu2fgi1k/image/upload/v1639879192/profile/avatars/default6.png';
          id= 6;
          break;
          case 'avatar7': this.avatar = 'https://res.cloudinary.com/dwu2fgi1k/image/upload/v1639879192/profile/avatars/default7.png';
          id= 7;
          break;
          case 'avatar8': this.avatar = 'https://res.cloudinary.com/dwu2fgi1k/image/upload/v1639879192/profile/avatars/default8.png';
          id= 8;
          break;
          case 'avatar9': this.avatar = 'https://res.cloudinary.com/dwu2fgi1k/image/upload/v1639879192/profile/avatars/default9.png'; 
          id= 9;
          break;
          case 'avatar10': this.avatar = 'https://res.cloudinary.com/dwu2fgi1k/image/upload/v1639879192/profile/avatars/default1.png'; 
          id= 1;
          break;
      }
      axios.post(url+'/profile/update/avatar/default/'+id,{},header)
      .then(result => {
      })
      .catch(error => {
        swal("Algo malio sal!", "Error al subir la foto: "+error.message , "error");
      });
    },
    logout: function () {
      localStorage.removeItem("token");
      this.token = null;
      swal("Vuelve pronto!", "Sesión cerrada correctamente", "info");
      setTimeout(function () {
        window.location.replace("/index.html");
      }, 5000);
      //swal("Algo salio mal!", "Ocurrió un error al cerrar sesión","error");
    },
    volver: function(){
      window.location.replace("/index.html");
    }
  }
});
