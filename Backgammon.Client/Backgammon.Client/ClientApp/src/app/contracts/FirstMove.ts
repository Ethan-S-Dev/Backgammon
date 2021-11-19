import { TwoNums } from "../models/TwoNums";

export interface FirstMove{
    PlayerOne:string,
    PlayerTwo:string,
    whosFirstCubes:TwoNums,
    playingCubes:TwoNums
}