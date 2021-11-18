using Backgammon.Services.Game.Api.Extantions;
using Backgammon.Services.Game.App.Interfaces;
using Backgammon.Services.Game.Domain.Models;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

namespace Backgammon.Services.Game.Api.HubConfig
{

    public class GameHub : Hub
    {
        IBoardManager _boardManager;
        IPlayerService _playerService;

        public GameHub(IBoardManager boardManager, IPlayerService playerService)
        {
            _boardManager = boardManager;
            _playerService = playerService;
        }

        public async override Task OnConnectedAsync()
        {
            string PlayerID = Context.User.getPlayerId();
            string PlayerName = Context.User.FindFirst(c => c.Type == "name").Value;
            if (_playerService.ConnectUser(PlayerID, PlayerName, Context.ConnectionId))
            {
                await Clients.Clients(_playerService.getAllOnlinePlayersConnectinosExceptThatID(Context.User.getPlayerId())).SendAsync("NewPlayerJoind", _playerService.Players[PlayerID]);
                await Clients.Caller.SendAsync("Connected", _playerService.Players);
            }
        }

        public async override Task OnDisconnectedAsync(Exception exception)
        {
            Console.Write(exception);
            string playerID = Context.UserIdentifier;
            if (_playerService.IfInGameGetGameID(playerID, out string gameID))//if he was in game
            {
                if (_boardManager.IsConnectionExistsInGame(gameID, Context.ConnectionId))
                {
                    string otherPlayerID = _boardManager.OnlineGames[gameID].GetOthersPlayerConnection(playerID);
                    await Clients.Client(otherPlayerID).SendAsync("HomePage", "Player disconnected");
                }
            }

            if (_playerService.DiscconectPlayer(playerID))//if its his last conection
                await Clients.All.SendAsync("PlayerDisconnected", playerID);
        }

        public async Task sendGameRequest(string reciverID)
        {
            if (!_playerService.IsAvalable(Context.UserIdentifier))
            {
                await Clients.Caller.SendAsync("HomePage", "You are alredy in a game");
            }
            if (!_playerService.IsAvalable(reciverID))//checking if not availble
            {
                await Clients.Caller.SendAsync("HomePage", "Player is not availble");
                return;
            }
            _playerService.Players.TryGetValue(reciverID, out Player Reciver);
            string senderID = Context.User.getPlayerId();
            _boardManager.GameRequests.Add(reciverID, new GameRequest() { SenderID = senderID, RecieverID = reciverID, SenderConnection = Context.ConnectionId });
            await Clients.Clients(Reciver.Connections).SendAsync("GameRequest", _playerService.Players[senderID].UserName);
            return;
        }

        public async Task gameRequestApproved(bool IsAccepted)//Try To Start the game and to send the Players The StartGameModel 
        {
            string receiverID = Context.User.getPlayerId();
            GameRequest gameRequest = _boardManager.GameRequests[receiverID];
            string senderConnectionString = gameRequest.SenderConnection;
            string reciverConnectionString = Context.ConnectionId;
            if (!IsAccepted)
            {
                await Clients.Client(senderConnectionString).SendAsync("RequestDenied", _playerService.Players[receiverID].UserName);
                return;
            }
            if (_playerService.IsAvalable(gameRequest.SenderID)) // if true starts a game
            {
                string gameID = _boardManager.AcceptGame(gameRequest, senderConnectionString, reciverConnectionString);//Removes the game request and create a new game
                GamePlay newGame = _boardManager.OnlineGames[gameID];
                _playerService.StartGame(newGame);
                StartGameModel startGameModel = _boardManager.GettingStartModel(newGame.FirstPlayerID, newGame.SecondPlayerID);
                newGame.InitGamePlay(startGameModel);//InitThePlayersTurnAndNumOfMovesLeft
                await Clients.Client(senderConnectionString).SendAsync("StartGame", startGameModel);
                await Clients.Client(Context.ConnectionId).SendAsync("StartGame", startGameModel);
                return;
            }
            else
            {
                await Clients.Client(Context.ConnectionId).SendAsync("ErrorPage", "Player is no more available");
                return;
            }
        }

        public async Task WaitingForAMove(PlayersMove playersMove, string gameID)
        {
            bool HasWon = false;
            GamePlay game = _boardManager.OnlineGames[gameID];
            Colors playersColor = new Colors();
            string CurrentPlayerConnection = Context.ConnectionId;
            string OtherPlayerConnection = game.GetOthersPlayerConnection(Context.UserIdentifier);

            if (Context.User.getPlayerId() != game.CurrentPlayersTurn)//אם הוא לא שלח בתורו
                return;

            if (Context.User.getPlayerId() == game.FirstPlayerID)
                playersColor = Colors.Player1;
            else
                playersColor = Colors.Player2;

            int CheckAvalblility = game.CheckAvailbilty(playersMove);//MoveStatus

            if (CheckAvalblility == -1)//checks All The Options
            {
                await Clients.Client(CurrentPlayerConnection).SendAsync("FuckOfYouCheater", "You Sick Fuck");//Sends the id of the cheating player
                await Clients.Client(OtherPlayerConnection).SendAsync("FuckOfYouCheater", "Your Oppenent Is Dumb");
                return;
            }
            else
            {
                HasWon = game.MoveTrueIfWins(playersMove, CheckAvalblility);//makes all the moves and The Board changes
                if (HasWon)
                {
                    string LossersID;

                    if (Context.User.getPlayerId() == game.FirstPlayerID)
                        LossersID = game.SecondPlayerID;
                    else
                        LossersID = game.FirstPlayerID;
                    await FinishGame(Context.User.getPlayerId(), LossersID, game.GameId);//storing the game information and ends the game
                    return;
                }
                if (!game.CurrentPlayes.HasMoreNumbers())
                {
                    var newNums = _boardManager.RollCubes();
                    game.switchPlayersTurnAndRollCubes(Context.User.getPlayerId(), newNums);
                    await Clients.Client(CurrentPlayerConnection).SendAsync("TurnIsOver", newNums);
                    await Clients.Client(OtherPlayerConnection).SendAsync("LastMoveOfOpponent", new LastMoveModel() { LastMove = playersMove, newNums = newNums });
                }
                else //If he didnt used all his Cubes
                {
                    if (game.IsThereMoreMovements(playersColor))
                    {
                        await Clients.Client(OtherPlayerConnection).SendAsync("OpponentMadeAMove", playersMove);
                        //send approval for the sender
                    }
                    else
                    {
                        var newNums = _boardManager.RollCubes();
                        game.switchPlayersTurnAndRollCubes(Context.User.getPlayerId(), newNums);
                        await Clients.Client(CurrentPlayerConnection).SendAsync("TurnIsOver", newNums);
                        await Clients.Client(OtherPlayerConnection).SendAsync("LastMoveOfOpponent", new LastMoveModel() { LastMove = playersMove, newNums = newNums });
                    }
                }



            }






        }

        public async Task FinishGame(string WinnerID, string LosserID, string GameID)
        {
            GamePlay game = _boardManager.OnlineGames[GameID];
            GameResult gameResult = new GameResult() { WinnerID = WinnerID, LosserID = LosserID };

            _playerService.FinishGame(gameResult);//מעדכנת את 
            _boardManager.FinishGame(GameID);
            await Clients.Client(game.FirstPlayerConnection).SendAsync("FinishGame", gameResult);
            await Clients.Client(game.SecondPlayerConnection).SendAsync("FinishGame", gameResult);

        }

        public async Task GetPlayerStats(string PlayersID)
        {
            PlayerStats playerStats = _playerService.GetPlayerStats(PlayersID);
            await Clients.Caller.SendAsync("getPlayerStats", playerStats);
            return;
        }

    }
}
