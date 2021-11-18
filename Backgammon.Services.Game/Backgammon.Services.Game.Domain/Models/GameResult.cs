using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Backgammon.Services.Game.Domain.Models
{
    public class GameResult
    {
        public string GameID { get; set; }
        public string WinnerID { get; set; }
        public string LosserID { get; set; }
        public DateTime gamesDate { get; set; }
    }
}
