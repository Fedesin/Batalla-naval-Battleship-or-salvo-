namespace Salvo.Models.DTO
{
    public class ShipDTO
    {
        public long Id { get; set; }
        public string Type { get; set; }
        public ICollection<ShipLocationDTO> Locations { get; set; }
    }
}
