import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Move } from 'src/app/contracts/Move';
import { TwoNums } from 'src/app/models/TwoNums';
import { GameService } from 'src/app/services/game/game.service';
import { AnimateDicesService } from './animate-dices.service';
import { AnimatePiecesService } from './animate-pieces.service';
import { LogicService } from './logic.service';
import { SoundService } from './sound.service';

@Injectable({
  providedIn: 'root'
})
export class GameBoardService {
  private isPlayerTurn:boolean = false;
  private playerColor:string = 'none';
  private gameId:string = '';

  private whitePieces = [0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,3,0,5,0,0,0,0,0,0];
  private blackPieces = [0,2,0,0,0,0,5,0,3,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0];
  private playerMoveable = [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false];
  private playerMoveableTo = [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false];
  private dices:{dice1:number,dice2:number} = {dice1:4,dice2:5};

  observeWhitePieces:BehaviorSubject<number[]> = new BehaviorSubject<number[]>(this.whitePieces);
  observeBlackPieces:BehaviorSubject<number[]> = new BehaviorSubject<number[]>(this.blackPieces);
  observeMoveable:BehaviorSubject<boolean[]> = new BehaviorSubject<boolean[]>(this.playerMoveable);
  observeMoveableTo:BehaviorSubject<boolean[]> = new BehaviorSubject<boolean[]>(this.playerMoveableTo);
  observeDices:BehaviorSubject<{dice1:number,dice2:number}> = new BehaviorSubject<{dice1:number,dice2:number}>(this.dices);

  constructor(private sound:SoundService,
    private animatePieces:AnimatePiecesService,
    private animateDices:AnimateDicesService,
    private logic:LogicService,
    private gameService:GameService) {

      gameService.onTurnOver.subscribe(async d=>{
        if(d)
        { 
          await this.doTurnOver(d)
        }
      });

      gameService.onOpponentMove.subscribe(async m=>{
        if(m){
          await this.doOpponentMove(m);
        }
      });

      gameService.onOpponentLastMove.subscribe(async l=>{
        if(l)
        {
          await this.doOpponentMove(l.opponentMove);

          await this.rollDices(l.yourDices.firstCube,l.yourDices.secondCube);

          this.isPlayerTurn = true;

          this.playerMoveable = this.logic.moveableFrom(l.yourDices,this.playerColor == 'white' ? this.whitePieces : this.blackPieces,this.playerColor == 'white' ? this.blackPieces : this.whitePieces);
          this.observeMoveable.next(this.playerMoveable);
        }
      });

  }

  async initGame(playerColor:string,isStarting:boolean,whoIsFirstRoll:TwoNums,firstRoll:TwoNums,gameId:string){
    this.playerColor = playerColor;
    this.isPlayerTurn = isStarting;
    this.gameId = gameId;
    this.initBoard();

    await this.startRollAnimation(whoIsFirstRoll);

    await this.rollDices(firstRoll.firstCube,firstRoll.secondCube);

    if(this.isPlayerTurn)
    {
      this.playerMoveable = this.logic.moveableFrom(firstRoll,this.playerColor == 'white' ? this.whitePieces : this.blackPieces,this.playerColor == 'white' ? this.blackPieces : this.whitePieces);
      this.observeMoveable.next(this.playerMoveable);
    }
  }
  private async startRollAnimation(whoIsFirstRoll: TwoNums) {
    let playerDice:number;
    let opDice:number;
    if(this.isPlayerTurn)
      if(whoIsFirstRoll.firstCube > whoIsFirstRoll.secondCube)
      {
        playerDice = whoIsFirstRoll.firstCube;
        opDice = whoIsFirstRoll.secondCube;
      }
      else 
      {
        playerDice = whoIsFirstRoll.secondCube;
        opDice = whoIsFirstRoll.firstCube;
      }
    else
    {
      if(whoIsFirstRoll.firstCube > whoIsFirstRoll.secondCube)
      {
        playerDice = whoIsFirstRoll.secondCube;
        opDice = whoIsFirstRoll.firstCube;
      }
      else 
      {
        playerDice = whoIsFirstRoll.firstCube;
        opDice = whoIsFirstRoll.secondCube;
      }
    }

    await this.rollDices(opDice,playerDice);
  }

  dragStarted(startedFrom:number){
    if(!this.isPlayerTurn)
      return;
    if(this.playerColor == 'white')
    {
      this.playerMoveableTo = this.logic.moveableTo({firstCube:this.dices.dice1,secondCube:this.dices.dice2},
        startedFrom,
        this.whitePieces,
        this.blackPieces);
    }else{
      this.playerMoveableTo = this.logic.moveableTo({firstCube:this.dices.dice1,secondCube:this.dices.dice2},
        startedFrom,
        this.blackPieces,
        this.whitePieces);
    }
    this.observeMoveableTo.next(this.playerMoveableTo);
  }

  dragStopped(){
    this.setAllFalse(this.playerMoveableTo);
    this.observeMoveableTo.next(this.playerMoveableTo);
  }

  async rollDices(dice1:number,dice2:number) {
    // call server get random numbers
    //this.observeDices.next(undefined);
    this.dices = {dice1:dice1,dice2:dice2};  
    this.sound.playDiceRoll();
    await this.animateDices.animate(this.dices.dice1,this.dices.dice2);
    this.observeDices.next(this.dices);
  }

  private async enemyRollDices(dice1:number,dice2:number) {
    this.dices = {dice1:dice1,dice2:dice2};  
    this.sound.playDiceRoll();
    await this.animateDices.animate(this.dices.dice1,this.dices.dice2);
    this.observeDices.next(this.dices);
  }

  async playerMove(from:number,to:number){

    // check logic

    //if ok to move!
    let numOfSteps = to-from;
    await this.gameService.sendMove({gameId:this.gameId,stackNumber:from,numOfSteps:numOfSteps});
    if(numOfSteps == this.dices.dice1)
    {
      this.dices.dice1 = 0;
    }else
    {
      this.dices.dice2 = 0;
    }
    this.observeDices.next(this.dices);
    await this.doMove(from,to,this.playerColor);
    this.playerMoveable = this.logic.moveableFrom({firstCube:this.dices.dice1,secondCube:this.dices.dice2},this.playerColor == 'white' ? this.whitePieces : this.blackPieces,this.playerColor == 'white' ? this.blackPieces : this.whitePieces);
    this.observeMoveable.next(this.playerMoveable);
  }

  async playerRemovePice(from:number,player:string){
    // check logic

    //if ok to move!
    await this.doRemove(from,player);
  }

  async doRandomMove(){
    let player = Math.floor(Math.random()*2)%2 == 0 ? 'white':'black';
    let playerIndexes = player == 'white' ? this.getIndexes(this.whitePieces):this.getIndexes(this.blackPieces);
    let fromIndex = Math.floor(Math.random()*playerIndexes.length);
    let from = playerIndexes[fromIndex];

    let remove = Math.floor(Math.random()*6) < 1;
    if(remove)
    {
      await this.doRemove(from,player);
      return;
    }

    let noEnemyIndexes = player == 'white' ? this.getMoveToIndexes(this.blackPieces):this.getMoveToIndexes(this.whitePieces);
    let toIndex = Math.floor(Math.random()*noEnemyIndexes.length);
    let to = noEnemyIndexes[toIndex];
    await this.doMove(from,to,player);
  }

  private setAllFalse(list:boolean[]){
    for (let index = 0; index < list.length; index++) {
      list[index] = false;
    }
  }

  private async doRemove(from:number,player:string){
    this.dragStopped();
    if(player == 'white')
    {
      this.whitePieces[from] = this.whitePieces[from]-1;
      this.updateWhite();
    }else{
      this.blackPieces[from] = this.blackPieces[from]-1;
      this.updateBlack();
    }

    try{
      let animation = await this.animatePieces.removePiece(player,from);
    }catch (error){
      console.error(error);
    }

    this.sound.playPieceMove();
  }

  private async doMove(from:number,to:number,player:string){
    this.dragStopped();
    if(player == 'white')
    {
      this.whitePieces[from] = this.whitePieces[from]-1;
      this.updateWhite();
    }else{
      this.blackPieces[from] = this.blackPieces[from]-1;
      this.updateBlack();
    }

    if(from != to)
    try{
      let animation = await this.animatePieces.movePiece(player,from,to);
    }catch (error){
      console.error(error);
    }

    if(player == 'white'){
        this.whitePieces[to] = this.whitePieces[to]+1;
        this.updateWhite();
      }
      else{ 
      
        this.blackPieces[to] = this.blackPieces[to]+1;
        this.updateBlack();
      }
      if(from != to)
        this.sound.playPieceMove();     
  }

  private updateWhite(){
    this.observeWhitePieces.next(this.whitePieces);
  }

  private updateBlack(){
    this.observeBlackPieces.next(this.blackPieces);
  }

  private updateMoveable(){
    this.observeMoveable.next(this.playerMoveable);
    this.observeMoveableTo.next(this.playerMoveableTo);
  }

  private updateState(){
   this.updateWhite();
   this.updateBlack();
   this.updateMoveable();  
  }

  private getIndexes(array:number[]):number[]{
    let result:number[] = [];
    array.forEach((e,i)=>{
      if(e!=0)
        result.push(i)
    })
    return result;
  }

  private getMoveToIndexes(array:number[]):number[]{
    let result:number[] = [];
    array.forEach((e,i)=>{
      if(e==0)
        result.push(i);
    });
    return result;
  }

  private async doTurnOver(nums:TwoNums){
    this.isPlayerTurn = false;
    this.setAllFalse(this.playerMoveable);
    this.setAllFalse(this.playerMoveableTo);
    this.updateMoveable();

    await this.enemyRollDices(nums.firstCube,nums.secondCube);
  }

  private async doOpponentMove(move:Move){
    let to = move.stackNumber + move.numOfSteps;
    let opponent = this.playerColor == 'white' ? 'black' : 'white';
    await this.doMove(move.stackNumber,to,opponent);
  }

  private initBoard(){
    if(this.playerColor == 'white')
    {
      this.whitePieces = [0,2,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,3,0,5,0,0,0,0,0,0];
      this.blackPieces = [0,0,0,0,0,0,5,0,3,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,2,0];
    }else{
      this.whitePieces = [0,0,0,0,0,0,5,0,3,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,2,0];
      this.blackPieces = [0,2,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,3,0,5,0,0,0,0,0,0];
    }
      this.setAllFalse(this.playerMoveable);
      this.setAllFalse(this.playerMoveableTo);
      this.updateState();
  }
}
