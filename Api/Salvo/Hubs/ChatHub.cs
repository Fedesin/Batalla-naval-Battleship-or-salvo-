using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Salvo.Models.DTO;
using Salvo.Repositories.Interface;

namespace Salvo.Hubs
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class ChatHub : Hub
    {
        private readonly IGamePlayerRepository _repository;
        private readonly IPlayerRepository _playerRepository;

        public ChatHub(IGamePlayerRepository repository, IPlayerRepository playerRepository)
        {
            _repository = repository;
            _playerRepository = playerRepository;
        }

        public async Task Chat(string email, long GameId, string message)
        {
            if (!_repository.IsUserInGameByEmail(email, GameId))
                Context.Abort();

            var player = _playerRepository.FindByEmail(email);
            var user = new
            {
                Name = player.Name,
                Email = player.Email,
                Avatar = player.Avatar
            };

            await Clients.Groups($"Game-{GameId}").SendAsync("Chat", user, message);
        }

        public async Task Broadcast(string username, string message)
        {
            await Clients.All.SendAsync("Broadcast", username, message);
        }

        public async Task SetGameGroup(string email, long GameId)
        {
            if (!_repository.IsUserInGameByEmail(email, GameId))
                Context.Abort();

            await Groups.AddToGroupAsync(Context.ConnectionId, $"Game-{GameId}");
        }

        public override Task OnConnectedAsync()
        {
            Console.WriteLine($"{Context.ConnectionId} connected");
            return base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception e)
        {
            Console.WriteLine($"Disconnected {e?.Message} {Context.ConnectionId}");
            await base.OnDisconnectedAsync(e);
        }
    }
}
