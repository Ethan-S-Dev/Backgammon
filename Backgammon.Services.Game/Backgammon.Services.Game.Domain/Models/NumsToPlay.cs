using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Backgammon.Services.Game.Domain.Models
{
    public class NumsToPlay
    {
        public NumToPlay[] NumbersToPlay { get; set; }
        public NumsToPlay(TwoNums nums)
        {
            if (nums.IsDouble())
            {
                NumbersToPlay = new NumToPlay[4];
                foreach (var num in NumbersToPlay)
                {
                    num.Number = nums.FirstCube;
                    num.IsPlayed = false;
                }
            }
            else
            {
                NumbersToPlay = new NumToPlay[2];
                NumbersToPlay[0].Number = nums.FirstCube;
                NumbersToPlay[1].Number = nums.SecondCube;
                NumbersToPlay[0].IsPlayed = false;
                NumbersToPlay[1].IsPlayed = false;
            }
        }
        public void UseNum(int Usednumber)
        {
            foreach (var num in NumbersToPlay)
            {
                if (num.Number == Usednumber && num.IsPlayed == false)
                {
                    num.IsPlayed = true;
                    return;
                }
            }
        }
        public bool HasMoreNumbers()
        {
            foreach (var number in NumbersToPlay)
            {
                if (number.IsPlayed == false)
                    return true;
            }
            return false;
        }
        public IEnumerable<int> GetAvalableNumbers()
        {
            foreach (var number in NumbersToPlay)
            {
                if (number.IsPlayed == false)
                    yield return number.Number;
            }
        }

        public bool IsNumAvalble(int number)
        {
            foreach (var num in NumbersToPlay)
            {
                if (num.Number == number && num.IsPlayed == false)
                    return true;
            }
            return false;
        }

    }

    public class NumToPlay
    {
        public int Number { get; set; }
        public bool IsPlayed { get; set; }
    }

}
