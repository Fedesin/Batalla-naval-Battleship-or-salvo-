namespace Salvo.Models.DTO
{
    public class SalvoHitDTO
    {
        public int Turn { get; set; }
        public List<ShipHitDTO> Hits { get; set; }
    }
}
