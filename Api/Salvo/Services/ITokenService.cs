using Salvo.Models;

namespace Salvo.Services
{
    public interface ITokenService
    {
        string BuildToken(string key, string issuer, Player user);
        bool IsTokenValid(string key, string issuer, string token);
    }
}
