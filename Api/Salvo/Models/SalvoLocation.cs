namespace Salvo.Models
{
    public class SalvoLocation
    {
        public long Id { get; set; }
        public string Location { get; set; }
        public long SalvoId { get; set; }
        public Salvo Salvo { get; set; }
    }
}
