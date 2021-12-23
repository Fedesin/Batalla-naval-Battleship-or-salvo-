using Salvo.Models;
using Salvo.Models.Response;

namespace Salvo.Repositories.Interface
{
    public interface IGameRepository
    {
        IEnumerable<Game> GetAllGames();

        GameRepositoryResponse GetAllGamesWithPlayers(int page, string email);

        GameRepositoryResponse GetMyGames(int page, string email);

        Game FindById(long id);

        void UpdateGame(Game game);


    }
}
