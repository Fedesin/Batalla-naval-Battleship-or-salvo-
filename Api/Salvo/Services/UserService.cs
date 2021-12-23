using Salvo.Models.Auth;
using Salvo.Repositories.Interface;
using Salvo.Utils;

namespace Salvo.Services
{
    public class UserService : IUserService
    {
        private IPlayerRepository _userManger;
        private IConfiguration _configuration;
        private IEmailSender _mailService;
        private ITokenService _tokenService;
        private IConfiguration _config;

        public UserService(IPlayerRepository userManager, IConfiguration configuration, IEmailSender mailService, ITokenService tokenService, IConfiguration config)
        {
            _userManger = userManager;
            _configuration = configuration;
            _mailService = mailService;
            _tokenService = tokenService;
            _config = config;
        }

        public async Task<UserManagerResponse> RegisterUserAsync(RegisterModel model)
        {
            var user = _userManger.FindByEmail(model.Email);
            if (user != null)
            {
                var confirmEmailToken = _tokenService.BuildToken(_config["Jwt:Key"].ToString(), _config["Jwt:Issuer"].ToString(), user);
                string url = $"{_configuration["AppUrl"]}/index.html?userid={user.Id}&modal=confirmemail&token={confirmEmailToken}";
                await _mailService.SendEmailAsync(user.Email, "Confirma tu email", $"<h1>Bienvenido a Salvo Game!!</h1>" +
                    $"<p>Confirma tu email dirigiéndote al siguiente link <a href='{url}'>Click Aqui</a></p>");

                return new UserManagerResponse
                {
                    Message = "Usuario registrado correctamente",
                    IsSuccess = true,
                };
            }

            return new UserManagerResponse
            {
                Message = "No se pudo registrar al usuario",
                IsSuccess = false
            };

        }

        public UserManagerResponse ConfirmEmail(long userId, string token)
        {
            var user = _userManger.FindById(userId);
            if (user == null)
                return new UserManagerResponse
                {
                    IsSuccess = false,
                    Message = "El usuario no existe"
                };

            if (user.EmailConfirmed)
                return new UserManagerResponse
                {
                    IsSuccess = false,
                    Message = "Este email ya habia sido confirmado anteriormente"
                };

            if (_tokenService.IsTokenValid(_config["Jwt:Key"].ToString(),
                _config["Jwt:Issuer"].ToString(), token))
            {
                user.EmailConfirmed = true;
                _userManger.Save(user);
                return new UserManagerResponse
                {
                    Message = "Email confirmado!",
                    IsSuccess = true,
                };
            }

            return new UserManagerResponse
            {
                IsSuccess = false,
                Message = "No se pudo confirmar el email",
            };
        }

        public async Task<UserManagerResponse> ForgetPasswordAsync(string email)
        {
            var user = _userManger.FindByEmail(email);
            if (user == null)
                return new UserManagerResponse
                {
                    IsSuccess = false,
                    Message = "El email no existe",
                };

            var token = _tokenService.BuildToken(_config["Jwt:Key"].ToString(), _config["Jwt:Issuer"].ToString(), user);
            string url = $"{_configuration["AppUrl"]}/index.html?email={email}&modal=resetpassword&token={token}";
            await _mailService.SendEmailAsync(email, "Recuperar Contraseña", "<h1>Sigue las instrucciones:</h1>" +
                $"<p>Para resetear la contraseña haga <a href='{url}'>Click Aqui</a></p>");

            return new UserManagerResponse
            {
                IsSuccess = true,
                Message = "La url con las instrucciones a seguir fue enviado a su correo electrónico"
            };
        }

        public UserManagerResponse ResetPassword(ResetPasswordModel model)
        {
            var user = _userManger.FindByEmail(model.Email);
            if (user == null)
                return new UserManagerResponse
                {
                    IsSuccess = false,
                    Message = "El email no existe",
                };

            if (!ExpresionesRegulares.IsValidPassword(model.NewPassword, out string mensaje))
                return new UserManagerResponse
                {
                    IsSuccess = false,
                    Message = mensaje
                };

            if (model.NewPassword != model.ConfirmPassword)
                return new UserManagerResponse
                {
                    IsSuccess = false,
                    Message = "Las contraseñas no coinciden",
                };

            if (_tokenService.IsTokenValid(_config["Jwt:Key"].ToString(),
                _config["Jwt:Issuer"].ToString(), model.Token))
            {

                user.Password = BCrypt.Net.BCrypt.EnhancedHashPassword(model.NewPassword);
                _userManger.Save(user);


                return new UserManagerResponse
                {
                    Message = "Su contraseña fue reestablecida correctamente",
                    IsSuccess = true,
                };
            }

            return new UserManagerResponse
            {
                Message = "Algo salió mal",
                IsSuccess = false,
            };
        }
    }
}
