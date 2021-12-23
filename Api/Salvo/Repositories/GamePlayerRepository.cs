using Microsoft.EntityFrameworkCore;
using Salvo.Models;
using Salvo.Repositories.Interface;

namespace Salvo.Repositories
{
    public class GamePlayerRepository : RepositoryBase<GamePlayer>, IGamePlayerRepository
    {
        public GamePlayerRepository(SalvoContext repositoryContext) : base(repositoryContext)
        {

        }

        public bool IsUserInGameByEmail(string email, long idGame)
        {
            return FindByCondition(gp => gp.GameId == idGame && gp.Player.Email == email).Any();
        }

        public GamePlayer GetGamePlayerView(long idGamePlayer)
        {
            return FindAll(source => source.Include(gamePlayer => gamePlayer.Ships)
                                               .ThenInclude(ship => ship.Locations)
                                            .Include(gamePlayer => gamePlayer.Salvos)
                                                .ThenInclude(salvo => salvo.Locations)
                                            .Include(gamePlayer => gamePlayer.Game)
                                                .ThenInclude(game => game.GamePlayers)
                                                    .ThenInclude(gp => gp.Player)
                                            .Include(gamePlayer => gamePlayer.Game)
                                                .ThenInclude(game => game.GamePlayers)
                                                    .ThenInclude(gp => gp.Salvos)
                                                        .ThenInclude(salvo => salvo.Locations)
                                            .Include(gamePlayer => gamePlayer.Game)
                                                .ThenInclude(game => game.GamePlayers)
                                                    .ThenInclude(gp => gp.Ships)
                                                        .ThenInclude(ship => ship.Locations)
                                            )
                .Where(gamePlayer => gamePlayer.Id == idGamePlayer)
                .OrderBy(game => game.JoinDate)
                .FirstOrDefault();
        }

        public GamePlayer FindById(long id)
        {
            return FindByCondition(gp => gp.Id == id)
                    .Include(gp => gp.Game)
                        .ThenInclude(game => game.GamePlayers)
                            .ThenInclude(gp => gp.Salvos)
                                .ThenInclude(salvo => salvo.Locations)
                    .Include(gp => gp.Game)
                        .ThenInclude(game => game.GamePlayers)
                            .ThenInclude(gp => gp.Ships)
                                .ThenInclude(ship => ship.Locations)
                    .Include(gp => gp.Player)
                    .Include(gp => gp.Ships)
                    .Include(gp => gp.Salvos)
                .FirstOrDefault();
        }


        public void Save(GamePlayer gameplayer)
        {
            if (gameplayer.Id == 0)
            {
                Create(gameplayer);
            }
            else
            {
                Update(gameplayer);
            }
            SaveChanges();
        }
    }
}
