namespace Backgammon.Services.Game.Infra.Extensions
{
    public static class Extensions
    {
        public static int getRandomNumber(this string str)
        {
            int.TryParse(str[str.Length - 3] + "", out int random);
            return random;
        }
    }
}
