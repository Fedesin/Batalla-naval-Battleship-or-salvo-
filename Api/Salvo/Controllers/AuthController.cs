using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Salvo.Models;
using Salvo.Models.Auth;
using Salvo.Repositories.Interface;
using Salvo.Services;
using Salvo.Utils;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Salvo.Controllers
{
    [Route("auth")]
    [ApiController]
    [AllowAnonymous]
    public class AuthController : ControllerBase
    {
        private readonly IPlayerRepository _repository;
        private readonly IConfiguration _configuration;
        private IEmailSender _mailService;
        private IUserService _userService;
        public AuthController(IPlayerRepository repository, IConfiguration configuration, IEmailSender mailService, IUserService userService)
        {
            _repository = repository;
            _configuration = configuration;
            _mailService = mailService;
            _userService = userService;
        }

        // GET api/values
        [HttpPost, Route("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel user)
        {
            try
            {
                if (string.IsNullOrEmpty(user.Email) && string.IsNullOrEmpty(user.Password))
                    return StatusCode(401, "No pueden estar ambos campos vacios!");
                if (string.IsNullOrEmpty(user.Email))
                    return StatusCode(401, "Rellene el correo electronico!");
                if (string.IsNullOrEmpty(user.Password))
                    return StatusCode(401, "Rellene el campo con la contraseña!");

                var player = _repository.FindByEmail(user.Email);

                if (player == null)
                    return StatusCode(401, "No existe el mail en la base de datos!");
                if (!BCrypt.Net.BCrypt.EnhancedVerify(user.Password, player.Password))
                    return StatusCode(401, "Contraseña incorrecta!");

                var tokenString = GenerateToken(player.Email, player.Name);

                await _mailService.SendEmailAsync(player.Email,
                                "Nuevo Inicio de Sesion", "<h1>Hola " + player.Name + "! </h1>" +
                                "<p> Se ha detectado un nuevo inicio de sesión en tu cuenta el " +
                                DateTime.Now.Date.ToShortDateString() + " a las " + DateTime.Now.TimeOfDay.ToString().Substring(0, 8) + "</p>");

                return Ok(new { Token = tokenString });

            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost, Route("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel user)
        {
            try
            {
                if (user is null || string.IsNullOrEmpty(user.Email) || string.IsNullOrEmpty(user.Password) || string.IsNullOrEmpty(user.Password))
                    return StatusCode(401, "Los campos no pueden estar vacios.");
                if (user.Name.Length > 8)
                    return StatusCode(401, "El usuario no puede tener mas de 8 caracteres");
                if (_repository.IsEmailInUse(user.Email))
                    return StatusCode(401, "Correo en uso.");
                if (!ExpresionesRegulares.IsValidEmail(user.Email))
                    return StatusCode(403, "Formato de correo invalido.");
                if (!ExpresionesRegulares.IsValidPassword(user.Password, out string mensaje))
                    return StatusCode(403, mensaje);

                var player = new Player
                {
                    Email = user.Email,
                    Name = user.Name,
                    Password = BCrypt.Net.BCrypt.EnhancedHashPassword(user.Password),
                    Avatar = "https://res.cloudinary.com/dwu2fgi1k/image/upload/v1639879192/profile/avatars/default0.png"
                };

                _repository.Save(player);

                var tokenString = GenerateToken(player.Email, player.Name);

                var result = await _userService.RegisterUserAsync(new RegisterModel
                {
                    Email = player.Email,
                    Password = player.Password,
                    Name = player.Name
                });

                if (result.IsSuccess)
                    return StatusCode(201, new { Token = tokenString });

                return BadRequest(result);

            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost, Route("verify"), Authorize]
        public IActionResult VerifyToken()
        {
            try
            {
                var userEmail = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email).Value ?? null;
                var userName = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name).Value ?? null;
                if (userEmail == null || userName == null || !_repository.IsEmailInUse(userEmail))
                    return Unauthorized();

                return Ok(new { Token = GenerateToken(userEmail, userName) }); ;
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        private string GenerateToken(string Email, string Name)
        {
            var avatar = _repository.GetAvatarByEmail(Email);
            var secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration.GetValue<string>("JWT:Key")));
            var signinCredentials = new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256);
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Email, Email),
                new Claim(ClaimTypes.Name, Name),
                new Claim("avatar", avatar)
            };
            var tokeOptions = new JwtSecurityToken(
                issuer: "https://salvo.g2csolutions.tech",
                audience: "https://salvo.g2csolutions.tech",
                claims: claims,
                expires: DateTime.Now.AddDays(_configuration.GetValue<int>("JWT:ExpireInDays")),
                signingCredentials: signinCredentials
            );
            return new JwtSecurityTokenHandler().WriteToken(tokeOptions);
        }

        //api/auth/confirmemail? userid&token
        [HttpGet, Route("confirmemail")]
        public IActionResult ConfirmEmail(long userId, string token)
        {

            if (string.IsNullOrWhiteSpace(token))
                return NotFound();

            var result = _userService.ConfirmEmail(userId, token);

            if (result.IsSuccess)
                return Ok(result);

            return BadRequest(result);
        }

        // api/auth/forgetpassword
        [HttpGet, Route("forgetpassword")]
        public async Task<IActionResult> ForgetPassword(string email)
        {
            if (string.IsNullOrEmpty(email))
                return NotFound();

            var result = await _userService.ForgetPasswordAsync(email);

            if (result.IsSuccess)
                return Ok(result);

            return BadRequest(result); // 400
        }

        // api/auth/resetpassword
        [HttpPost, Route("resetpassword")]
        public IActionResult ResetPassword([FromBody] ResetPasswordModel model)
        {
            if (ModelState.IsValid)
            {
                var result = _userService.ResetPassword(model);

                if (result.IsSuccess)
                    return Ok(result);

                return BadRequest(result);
            }

            return BadRequest("Alguno de los campos es inválido");
        }

    }
}
