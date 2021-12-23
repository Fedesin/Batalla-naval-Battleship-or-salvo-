namespace Salvo.Models
{
    public class Game
    {
        public long Id { get; set; }
        public DateTime? CreationDate { get; set; }
        public ICollection<GamePlayer> GamePlayers { get; set; }
        public GameState State { get; set; }
        //public ICollection<Score> Scores { get; set; }
    }
}
