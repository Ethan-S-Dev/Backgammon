using Backgammon.Services.Game.App.Interfaces;
using Backgammon.Services.Game.Domain.Interfaces;
using Backgammon.Services.Game.Domain.Models;
using System.Collections.Generic;
using System.Linq;

namespace Backgammon.Services.Game.App.Services
{
    public class PlayersService : IPlayerService
    {
        public Dictionary<string, Player> Players { get; set; }
        public IRepository _repository { get; set; }


        public PlayersService(IRepository repository)
        {
            _repository = repository;
        }

        public Player GetPlayerFromRepo(string Id, string ConnectionId) => _repository.GetPlayerFromRepo(Id, ConnectionId); //getsPlayerFromRepositor

        public bool IsUserConnected(string UserID)
        {
            if (Players.TryGetValue(UserID, out Player player))
                return true;
            else
                return false;
        }

        public IReadOnlyList<string> getAllOnlinePlayersConnectinosExceptThatID(string userID) //returns all the connections of all the players besides the ChosenOne
        {
            var players = Players.Where(p => p.Value.ID != userID).ToList();
            List<string> connections = new();
            players.ForEach(p => p.Value.Connections.ForEach(c => connections.Add(c)));
            return connections;
        }

        public bool ConnectUser(string PlayerID, string UserName, string ConnectionString) //returns false if the player alredy online
        {
            if (IsUserConnected(PlayerID))
            {
                Players[PlayerID].NumberOfConnections++;
                return false;
            }
            if (!_repository.IsExist(PlayerID))
            {
                _repository.AddNewPlayer(PlayerID, UserName);
            }
            var connectedPlayer = _repository.GetPlayerFromRepo(PlayerID, ConnectionString);
            Players.Add(PlayerID, connectedPlayer);

            return true;
        }

        public bool IfInGameGetGameID(string playerId, out string GameId)
        {
            if (Players.TryGetValue(playerId, out Player player))
                if (player.InGame)
                {
                    GameId = player.GameId;
                    return true;
                }
            GameId = "e";
            return false;
        }

        public bool DiscconectPlayer(string playerId)
        {
            if (Players[playerId].NumberOfConnections == 1)
            {
                Players.Remove(playerId);
                return true;
            }
            Players[playerId].NumberOfConnections--;
            return false;
        }

        public void StartGame(GamePlay game)
        {
            Players[game.FirstPlayerID].GameId = game.GameId;
            Players[game.SecondPlayerID].GameId = game.GameId;
        }

        public bool IsAvalable(string PlayerID)
        {
            if (Players.TryGetValue(PlayerID, out Player p))
                if (!p.InGame)
                    return true;
            return false;
        }

        public void FinishGame(GameResult gameResult)
        {
            Players.TryGetValue(gameResult.WinnerID, out Player Winner);
            Players.TryGetValue(gameResult.LosserID, out Player Losser);
            Winner.GameId = "e";
            GameResultToHistory WinnersGame = new GameResultToHistory() { PlayerDtoID = gameResult.WinnerID, ID = gameResult.GameID + "W", HasWon = true, ComponentsID = gameResult.LosserID };
            Winner.GameHistory.Add(WinnersGame);
            Losser.GameId = "e";
            GameResultToHistory LosserGame = new GameResultToHistory() { PlayerDtoID = gameResult.LosserID, ID = gameResult.GameID + "L", HasWon = false, ComponentsID = gameResult.WinnerID };
            Losser.GameHistory.Add(LosserGame);
            _repository.UpdatePlayersResutlsAfterGame(WinnersGame, LosserGame);

        }

        private int GetPlayersWinPrecentage(string playerID)
        {
            Players.TryGetValue(playerID, out Player player);
            int wins = player.GameHistory.Where(g => g.HasWon == true).Count();
            int losses = player.GameHistory.Where(g => g.HasWon == false).Count();
            return wins / (wins + losses) * 100;
        }

        private int GetPlayersTotalPlayes(string playerID)
        {
            Players.TryGetValue(playerID, out Player player);
            return player.GameHistory.Count();
        }

        public PlayerStats GetPlayerStats(string playerID) => new PlayerStats() { GamePlayed = GetPlayersTotalPlayes(playerID), WinPrecentage = GetPlayersWinPrecentage(playerID) };

        //public bool IsConnected(Guid PlayerID)
        //{
        //    if (Players.TryGetValue(PlayerID, out Player p))
        //        return true;
        //    else return false;
        //}

    }
}
