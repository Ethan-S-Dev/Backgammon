import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  left_top = [12,13,14,15,16,17];
  left_bottom = [11,10,9,8,7,6];

  right_top = [18,19,20,21,22,23];
  right_bottom = [5,4,3,2,1,0];

  whitePieces:number[] = [2,0,6,0,0,0,0,0,0,0,0,15,0,0,0,0,3,0,15,0,0,0,0,0];
  blackPieces:number[] = [0,0,0,0,0,15,0,3,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,2];

  moveable = [true,false,true,false,false,false,false,false,false,false,false,true,false,false,false,false,true,false,true,false,false,false,false,false];

  constructor() { }

  ngOnInit(): void {
  }
  allowDrop(ev:DragEvent){
    ev.preventDefault();
  }

  drop(ev:DragEvent,toStack:number){
    ev.preventDefault();
    let fromStack = ev.dataTransfer?.getData("fromStack");
    let pieceColor = ev.dataTransfer?.getData("color");
    console.log(`Drop ${pieceColor} piece from ${fromStack} to ${toStack}`)
  }

}
