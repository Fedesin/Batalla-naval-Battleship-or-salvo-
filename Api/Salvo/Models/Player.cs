namespace Salvo.Models
{
    public class Player
    {
        public long Id { get; set; }
        public string Email { get; set; }
        public string Name { get; set; }
        public string Password { get; set; }
        public bool EmailConfirmed { get; set; }
        public ICollection<GamePlayer> GamePlayers { get; set; }

        public double Points { get; set; }

        public int Jugadas { get; set; }

        public int Ganadas { get; set; }

        public int Empatadas { get; set; }

        public string Avatar { get; set; }

        //public ICollection<Score> Scores { get; set; }

        /*
            public Score GetScore(Game game)
            {
                return Scores.FirstOrDefault(score => score.GameId == game.Id);
            }
        */
    }
}
