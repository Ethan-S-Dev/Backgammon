import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { GameBoardService } from '../../services/game-board.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  readonly left_top = [13, 14, 15, 16, 17, 18];
  readonly left_bottom = [12, 11, 10, 9, 8, 7];
  readonly right_top = [19, 20, 21, 22, 23, 24];
  readonly right_bottom = [6, 5, 4, 3, 2, 1];

  moveable: boolean[] = [];
  moveableTo: boolean[] = [];
  blackPieces: number[] = [];
  whitePieces: number[] = [];
  dices: { dice1: number, dice2: number } | undefined;

  constructor(private logic: GameBoardService, private cdr: ChangeDetectorRef) {

  }


  ngOnInit(): void {
    this.logic.observeBlackPieces.subscribe(p => this.blackPieces = p);
    this.logic.observeWhitePieces.subscribe(p => this.whitePieces = p);
    this.logic.observeMoveable.subscribe(m => this.moveable = m);
    this.logic.observeMoveableTo.subscribe(m =>{ this.moveableTo = m; console.log(m);});
    this.logic.observeDices.subscribe(d => this.dices = d);
  }
  allowDrop(ev: DragEvent,i:number) {
    if(this.moveableTo[i])
      ev.preventDefault();
  }

  async drop(ev: DragEvent, toStack: number) {
    ev.preventDefault();
    this.logic.dragStopped();
    let fromStack = ev.dataTransfer?.getData("fromStack");
    let pieceColor = ev.dataTransfer?.getData("color");
    console.log(`Drop ${pieceColor} piece from ${fromStack} to ${toStack}`)
    if (fromStack && pieceColor) {
      let from = new Number(fromStack) as number;
      await this.logic.playerMove(from, toStack, pieceColor);
    }
   
  }

  allowDropOut(ev: DragEvent) {
    ev.preventDefault();
  }

  async dropOut(ev: DragEvent) {
    ev.preventDefault();
    let fromStack = ev.dataTransfer?.getData("fromStack");
    let pieceColor = ev.dataTransfer?.getData("color");
    console.log(`Removed ${pieceColor} piece from ${fromStack}`)
    if (fromStack && pieceColor) {
      let from = new Number(fromStack) as number;
      await this.logic.playerRemovePice(from,pieceColor);
    }
  }

  dragStarted(from:number){
    this.logic.dragStarted(from);
  }

  dragEnded(from:number){
    this.logic.dragStopped();
  }

  async randomMove() {
    await this.logic.doRandomMove();
  }

  async rollDices() {
    await this.logic.rollDices();
  }
}
