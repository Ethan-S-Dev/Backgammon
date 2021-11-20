import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { StartGame } from 'src/app/models/StartGame';
import { GameBoardService } from '../../services/game-board.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  @Input() game:StartGame|undefined;

  readonly left_top = [12, 11, 10, 9, 8, 7];
  readonly left_bottom = [13, 14, 15, 16, 17, 18];
  readonly right_top = [6, 5, 4, 3, 2, 1];
  readonly right_bottom = [19, 20, 21, 22, 23, 24];

  moveable: boolean[] = [];
  moveableTo: boolean[] = [];
  blackPieces: number[] = [];
  whitePieces: number[] = [];
  dices: { dice1: number, dice2: number } | undefined;

  constructor(private boardService: GameBoardService) {

  }

  ngOnInit(): void {
    if(this.game)
      this.boardService.initGame(this.game.playerColor,this.game.isStarting,this.game.whoIsFirstRoll,this.game.firstRoll,this.game.gameId);
    this.boardService.observeBlackPieces.subscribe(p => this.blackPieces = p);
    this.boardService.observeWhitePieces.subscribe(p => this.whitePieces = p);
    this.boardService.observeMoveable.subscribe(m => this.moveable = m);
    this.boardService.observeMoveableTo.subscribe(m =>{ this.moveableTo = m;});
    this.boardService.observeDices.subscribe(d => this.dices = d);
  }

  allowDrop(ev: DragEvent,i:number) {
    if(this.moveableTo[i])
      ev.preventDefault();
  }

  async drop(ev: DragEvent, toStack: number) {
    ev.preventDefault();
    this.boardService.dragStopped();
    let fromStack = ev.dataTransfer?.getData("fromStack");
    let pieceColor = ev.dataTransfer?.getData("color");
    console.log(`Drop ${pieceColor} piece from ${fromStack} to ${toStack}`)
    if (fromStack && pieceColor) {
      let from = new Number(fromStack) as number;
      await this.boardService.playerMove(from, toStack);
    }
   
  }

  allowDropOut(ev: DragEvent) {
    if(this.moveableTo[25])
      ev.preventDefault();
  }

  async dropOut(ev: DragEvent) {
    ev.preventDefault();
    let fromStack = ev.dataTransfer?.getData("fromStack");
    if (fromStack) {
      let from = new Number(fromStack) as number;
      await this.boardService.playerRemovePice(from);
    }
  }

  dragStarted(from:number){
    this.boardService.dragStarted(from);
  }

  dragEnded(from:number){
    this.boardService.dragStopped();
  }

  // async rollDices() {
  //   await this.boardService.rollDices();
  // }
}
