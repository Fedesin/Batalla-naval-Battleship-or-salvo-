using Salvo.Models;
using Salvo.Models.DTO;
using Salvo.Repositories.Interface;

namespace Salvo.Repositories
{
    public class PlayerRepository : RepositoryBase<Player>, IPlayerRepository
    {
        public PlayerRepository(SalvoContext repositoryContext) : base(repositoryContext)
        {

        }

        public string GetAvatarByEmail(string email)
        {
            return FindByCondition(p => p.Email == email).Select(p => p.Avatar).FirstOrDefault();
        }

        public bool IsEmailInUse(string email)
        {
            return FindByCondition(player => player.Email == email).Any();
        }

        public Player FindByEmail(string email)
        {
            return FindByCondition(player => player.Email == email).FirstOrDefault();
        }

        public Player FindById(long id)
        {
            return FindByCondition(player => player.Id == id)
                .FirstOrDefault();
        }

        public void Save(Player player)
        {
            if (player.Id == 0)
                Create(player);
            else
                Update(player);
            SaveChanges();
        }

        public List<PlayerRankDTO> TopFive()
        {
            return FindAll()
                .OrderByDescending(player => player.Points)
                .Take(5)
                .Select(p => new PlayerRankDTO
                {
                    Id = p.Id,
                    Name = p.Name,
                    Points = p.Points,
                    Jugadas = p.Jugadas,
                    Ganadas = p.Ganadas,
                    Empatadas = p.Empatadas,
                    Avatar = p.Avatar
                })
                .ToList();

        }


    }
}
