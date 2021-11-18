using Backgammon.Services.Game.App.Interfaces;
using Backgammon.Services.Game.Domain.Interfaces;
using Backgammon.Services.Game.Domain.Models;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Backgammon.Services.Game.Api.Controllers
{
    public class GameController : Controller
    {
        ICubeService _cubeService;
        IPlayerService _playerService;
        public GameController(ICubeService cubeService, IPlayerService playerService)
        {
            _cubeService = cubeService;
            _playerService = playerService;
        }

        public async Task<string> RollCubes()
        {
            int[] nums = new int[2];
            nums[0] = _cubeService.RollCube().Result;
            Thread.Sleep(1000);
            nums[1] = _cubeService.RollCube().Result;
            return nums.ToString();
        }

        public Dictionary<string, Player> UpdateOnlineUsers() => _playerService.Players;
    }



}
