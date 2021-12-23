namespace Salvo.Models.DTO
{
    public class GamePlayerDTO
    {
        public long Id { get; set; }
        public DateTime JoinDate { get; set; }
        public long PlayerId { get; set; }
        public PlayerDTO Player { get; set; }
        public double? Point { get; set; }

        public GameState? State { get; set; }


    }
}
