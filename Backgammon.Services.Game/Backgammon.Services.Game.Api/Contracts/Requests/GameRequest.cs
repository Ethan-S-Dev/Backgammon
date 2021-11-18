using System;

namespace Backgammon.Services.Game.Api.Contracts.Requests
{
    public class GameRequest
    {
        public Guid SenderID { get; set; }
        public Guid RecieverID { get; set; }
    }
}
