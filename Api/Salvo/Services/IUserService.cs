using Salvo.Models.Auth;

namespace Salvo.Services
{
    public interface IUserService
    {
        Task<UserManagerResponse> RegisterUserAsync(RegisterModel model);
        UserManagerResponse ConfirmEmail(long userId, string token);
        Task<UserManagerResponse> ForgetPasswordAsync(string email);
        UserManagerResponse ResetPassword(ResetPasswordModel model);
    }
}
