using Microsoft.EntityFrameworkCore;
using Salvo.Models;
using Salvo.Models.Response;
using Salvo.Repositories.Interface;

namespace Salvo.Repositories
{
    public class GameRepository : RepositoryBase<Game>, IGameRepository
    {
        public GameRepository(SalvoContext repositoryContext) : base(repositoryContext)
        {

        }

        public Game FindById(long id)
        {
            return FindByCondition(game => game.Id == id)
                .Include(game => game.GamePlayers)
                .ThenInclude(gp => gp.Player)
                .FirstOrDefault();
        }

        public IEnumerable<Game> GetAllGames()
        {

            return FindAll()
                  .OrderBy(game => game.CreationDate)
                  .ToList();

        }

        public GameRepositoryResponse GetMyGames(int page, string email)
        {
            int itemPerPage = 10;

            var games = FindByCondition(game => game.GamePlayers.FirstOrDefault(gp => gp.Player.Email == email) != null)
                        .Include(game => game.GamePlayers)
                            .ThenInclude(gp => gp.Player)
                        //.ThenInclude(p => p.Scores)
                        .OrderByDescending(game => game.CreationDate)
                        .Skip(itemPerPage * (page - 1))
                        .Take(itemPerPage)
                        .ToList();

            int totalCount = FindByCondition(game => game.GamePlayers.FirstOrDefault(gp => gp.Player.Email == email) != null).Count();

            int totalPage = (int)Math.Ceiling(totalCount / (double)itemPerPage);

            return new GameRepositoryResponse
            {
                totalCount = totalCount,
                itemPerPage = itemPerPage,
                totalPages = totalPage,
                games = games
            };
        }


        public GameRepositoryResponse GetAllGamesWithPlayers(int page, string email)
        {
            int itemPerPage = 10;

            var games = FindByCondition(game => game.GamePlayers.Count == 1 && game.GamePlayers.FirstOrDefault(gp => gp.Player.Email == email) == null)
                        .Include(game => game.GamePlayers)
                            .ThenInclude(gp => gp.Player)
                        //.ThenInclude(p => p.Scores)
                        .OrderByDescending(game => game.CreationDate)
                        .Skip(itemPerPage * (page - 1))
                        .Take(itemPerPage)
                        .ToList();

            int totalCount = FindByCondition(game => game.GamePlayers.Count == 1 && game.GamePlayers.FirstOrDefault(gp => gp.Player.Email == email) == null).Count();

            int totalPage = (int)Math.Ceiling(totalCount / (double)itemPerPage);

            return new GameRepositoryResponse
            {
                totalCount = totalCount,
                itemPerPage = itemPerPage,
                totalPages = totalPage,
                games = games
            };
        }

        public void UpdateGame(Game game)
        {

            Update(game);

            SaveChanges();
        }

    }
}
