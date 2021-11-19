using Backgammon.Services.Game.Domain.Models;
using Backgammon.Services.Game.Infra.DbModels;
using Microsoft.EntityFrameworkCore;

namespace Backgammon.Services.Game.Infra
{
    public class GameDataContext : DbContext
    {
        public GameDataContext(DbContextOptions<GameDataContext> options) : base(options)
        {
        }

        public DbSet<GameResultToHistory> GameResults { get; set; }
        public DbSet<PlayerDto> Players { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            modelBuilder.Entity<PlayerDto>().HasData(
             new PlayerDto() { ID = "Hey", UserName = "svfvfv" },
             new PlayerDto() { ID = "Whats", UserName = "svxz" },
             new PlayerDto() { ID = "Up", UserName = "rskgmkr" }
             );

            modelBuilder.Entity<GameResultToHistory>().HasData(
          new GameResultToHistory() { ID = "fdssW", PlayerDtoID = "Hey", ComponentsID = "Up", HasWon = true },
          new GameResultToHistory() { ID = "fdssL", PlayerDtoID = "Up", ComponentsID = "Hey", HasWon = false }
          );

        }
    }
}
