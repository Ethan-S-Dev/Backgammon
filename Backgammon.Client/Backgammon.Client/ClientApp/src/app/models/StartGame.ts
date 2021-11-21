import { TwoNums } from "./TwoNums";

export interface StartGame{
    gameId:string,
    playerColor:string,
    isStarting:boolean,
    whoIsFirstRoll:TwoNums,
    firstRoll:TwoNums,
    opponentName:string
}