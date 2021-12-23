using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salvo.Models;
using Salvo.Models.DTO;
using Salvo.Repositories.Interface;
using Salvo.Utils;
using System.Security.Claims;

namespace Salvo.Controllers
{
    [Route("profile")]
    [ApiController]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly IPlayerRepository _repository;
        private readonly IConfiguration _configuration;


        public ProfileController(IPlayerRepository repository, IConfiguration configuration)
        {
            _repository = repository;
            _configuration = configuration;
        }

        [HttpGet]
        public IActionResult Get()
        {
            try
            {
                string email = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email).Value ?? "Guest";

                if (email == "Guest")
                {
                    return StatusCode(401, "Debe registrarse para ver el perfil de usuario.");
                }
                Player PlayerLogeado = _repository.FindByEmail(email);
                if (PlayerLogeado == null)
                {
                    return StatusCode(404, "No existe un jugador registrado con ese email");
                }

                var jugador = new PlayerDTO
                {
                    Name = PlayerLogeado.Name,
                    Avatar = PlayerLogeado.Avatar,
                    Email = email,
                    Points = PlayerLogeado.Points,
                    Ganadas = PlayerLogeado.Ganadas,
                    Empatadas = PlayerLogeado.Empatadas,
                    Jugadas = PlayerLogeado.Jugadas,
                    Id = PlayerLogeado.Id
                };
                return Ok(jugador);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }



        [HttpPut("update")]
        public IActionResult Post([FromBody] PlayerActualizarDTO p)
        {
            try
            {

                string email = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email).Value ?? "Guest";


                if (email == "Guest")
                    return StatusCode(401, "Debe registrarse para ver el perfil de usuario.");


                Player PlayerLogeado = _repository.FindByEmail(email);


                if (PlayerLogeado == null)
                    return StatusCode(404, "No existe un jugador registrado con ese email");
                if (p.Password != "" && p.Password != null)
                {
                    if (!BCrypt.Net.BCrypt.EnhancedVerify(p.OldPassword, PlayerLogeado.Password))
                        return StatusCode(401, "Contraseña incorrecta");

                    if (p.OldPassword == p.Password)
                        return StatusCode(400, "Las contraseñas son identicas.");
                }

                if (ExpresionesRegulares.IsValidPassword(p.Password, out string mensaje) && p.Password != "" && p.Password != null)
                    PlayerLogeado.Password = BCrypt.Net.BCrypt.EnhancedHashPassword(p.Password);

                if (p.Name != "" && p.Name != null)
                {
                    if (p.Name.Length <= 3 || p.Name.Length >= 8)
                        return StatusCode(400, "Ingrese un nombre entre 3 y 8 caracteres");
                    else
                        PlayerLogeado.Name = p.Name;
                }
                _repository.Save(PlayerLogeado);
                return Ok(PlayerLogeado);
            }
            catch (Exception ex)
            {

                return StatusCode(500, ex);
            }
        }

        [HttpPost("update/avatar"), DisableRequestSizeLimit]
        public IActionResult Upload(IFormFile photo)
        {
            try
            {
                string email = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email).Value ?? "Guest";
                var player = _repository.FindByEmail(email);
                if (player == null)
                    return BadRequest();
                var stream = photo.OpenReadStream();
                var cloudinary = new Cloudinary(new Account(
                    _configuration.GetValue<string>("Cloudinary:Cloud"),
                    _configuration.GetValue<string>("Cloudinary:ApiKey"),
                    _configuration.GetValue<string>("Cloudinary:ApiSecret")
                    ));


                var uploadParams = new ImageUploadParams()
                {
                    File = new FileDescription(photo.Name, stream),
                    PublicId = "profile/avatars/" + player.Id,
                    Overwrite = true,
                    Transformation = Transformation.ResponsiveWidthTransform.Height(250).Crop("scale")

                };
                var uploadResult = cloudinary.Upload(uploadParams);
                player.Avatar = uploadResult.SecureUrl.ToString();
                _repository.Save(player);
                return Ok(new { avatar = uploadResult.SecureUrl.ToString() });

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex}");
            }
        }

        [HttpPost("update/avatar/default/{id}")]
        public IActionResult SetDefaultAvatar(int id)
        {
            try
            {
                string email = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email).Value ?? "Guest";
                var player = _repository.FindByEmail(email);
                if (player == null || id < 0 || id > 10)
                    return BadRequest();


                player.Avatar = "https://res.cloudinary.com/dwu2fgi1k/image/upload/v1639981426/profile/avatars/default" + id + ".png";
                _repository.Save(player);
                return Ok(new { avatar = "https://res.cloudinary.com/dwu2fgi1k/image/upload/v1639981426/profile/avatars/default" + id + ".png" });

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex}");
            }
        }
    }
}
