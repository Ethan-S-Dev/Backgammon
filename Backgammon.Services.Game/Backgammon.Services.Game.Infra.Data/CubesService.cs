using Backgammon.Services.Game.Domain.Interfaces;
using Backgammon.Services.Game.Domain.Models;
using Backgammon.Services.Game.Infra.Extensions;
using System;
using System.Net.Http;
using System.Threading.Tasks;

namespace Backgammon.Services.Game.Infra
{
    public class CubesService : ICubeService
    {
        private readonly int minNumber = 1;
        private readonly int maxNumber = 6;
        private readonly HttpClient httpClient;
        public string fullPath;
        Random rnd = new Random();



        public CubesService(HttpClient httpClient)
        {
            fullPath = $"https://csrng.net/csrng/csrng.php?min={minNumber}&max={maxNumber}";
            this.httpClient = httpClient;
        }
        public async Task<int> RollCube()
        {
            TwoNums twoNums = new();

            using (HttpResponseMessage httpResponse = httpClient.GetAsync(fullPath).Result)
            {
                if (httpResponse.IsSuccessStatusCode)
                {
                    string s = httpResponse.Content.ReadAsStringAsync().Result;
                    return s.getRandomNumber();
                }
                else
                    return rnd.Next(minNumber, maxNumber + 1);

            }
        }
    }
}
