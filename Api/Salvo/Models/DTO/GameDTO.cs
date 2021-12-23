namespace Salvo.Models.DTO
{
    public class GameDTO
    {
        public long Id { get; set; }
        public DateTime? CreationDate { get; set; }
        public ICollection<GamePlayerDTO> GamePlayers { get; set; }
        public GameState State { get; set; }
    }
}
