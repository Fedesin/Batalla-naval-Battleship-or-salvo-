namespace Salvo.Models.DTO
{
    public class SalvoDTO
    {
        public long Id { get; set; }
        public int Turn { get; set; }
        public PlayerDTO? Player { get; set; }
        public ICollection<SalvoLocationDTO> Locations { get; set; }
    }
}
