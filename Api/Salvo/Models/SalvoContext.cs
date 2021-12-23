using Microsoft.EntityFrameworkCore;

namespace Salvo.Models
{
    public class SalvoContext : DbContext
    {
        public SalvoContext(DbContextOptions<SalvoContext> options) : base(options)
        {

        }

        public DbSet<Player> Players { get; set; }
        public DbSet<Game> Games { get; set; }
        public DbSet<GamePlayer> GamePlayers { get; set; }
        public DbSet<Ship> Ships { get; set; }
        public DbSet<ShipLocation> ShipLocations { get; set; }
        public DbSet<Salvo> Salvos { get; set; }
        public DbSet<SalvoLocation> SalvoLocations { get; set; }
        //public DbSet<Score> Scores { get; set; }
    }
}
