namespace Salvo.Models.Response
{
    public class GameRepositoryResponse
    {
        public int totalCount { get; set; }
        public int itemPerPage { get; set; }
        public int totalPages { get; set; }
        public IEnumerable<Game> games { get; set; }
    }
}
