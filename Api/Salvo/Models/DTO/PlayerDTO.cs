namespace Salvo.Models.DTO
{
    public class PlayerDTO
    {
        public long Id { get; set; }
        public string Email { get; set; }
        public string Name { get; set; }
        public double Points { get; set; }
        public int Jugadas { get; set; }
        public int Ganadas { get; set; }
        public int Empatadas { get; set; }
        public string Avatar { get; set; }

    }
}
