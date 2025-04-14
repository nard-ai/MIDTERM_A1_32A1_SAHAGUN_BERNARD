using Microsoft.EntityFrameworkCore;
using SlotMachineBackend.Models; // 👈 This connects to your models

namespace SlotMachineBackend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

        public DbSet<Player> Players { get; set; }
        public DbSet<GameResult> GameResults { get; set; }
    }
}
