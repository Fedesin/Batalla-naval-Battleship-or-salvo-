using Salvo.Models.DTO;

namespace Salvo.Models.Response
{
    public class GameViewResponse
    {
        public int TotalCount { get; set; }
        public int ItemPerPage { get; set; }
        public int TotalPage { get; set; }
        public int Page { get; set; }
        public string Email { get; set; }
        public List<GameDTO> Games { get; set; }
    }
}
