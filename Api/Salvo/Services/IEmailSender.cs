namespace Salvo.Services
{
    public interface IEmailSender
    {
        Task SendEmailAsync(string email, string subject, string message);
        public Task Execute(string apiKey, string subject, string message, string email);
    }
}
