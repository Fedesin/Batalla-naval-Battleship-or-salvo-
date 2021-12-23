using Salvo.Models;
using Salvo.Models.DTO;

namespace Salvo.Repositories.Interface
{
    public interface IPlayerRepository
    {
        public bool IsEmailInUse(string email);
        Player FindByEmail(string email);
        public Player FindById(long id);
        void Save(Player player);
        List<PlayerRankDTO> TopFive();
        string GetAvatarByEmail(string email);
    }
}
