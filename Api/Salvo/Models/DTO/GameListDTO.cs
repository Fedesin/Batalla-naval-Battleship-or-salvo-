namespace Salvo.Models.DTO
{
    public class GameListDTO
    {
        public string Email { get; set; }
        public ICollection<GameDTO> Games { get; set; }

        public string Name { get; set; }

    }
}
