namespace Salvo.Models
{
    public class ShipLocation
    {
        public long Id { get; set; }
        public string Location { get; set; }
        public long ShipId { get; set; }
        public Ship Ship { get; set; }
    }
}
