using Salvo.Models;

namespace Salvo.Repositories.Interface
{
    public interface IGamePlayerRepository
    {
        public bool IsUserInGameByEmail(string email, long idGame);
        GamePlayer GetGamePlayerView(long idGamePlayer);
        void Save(GamePlayer gamePlayer);
        GamePlayer FindById(long id);
    }
}