import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-stack',
  templateUrl: './stack.component.html',
  styleUrls: ['./stack.component.css']
})
export class StackComponent implements OnInit {

  @Input() stackNumber:number = 0;

  @Input() isBottom:boolean = false;

  @Input() isLastMoveable:boolean = false;

  @Input() whitePieces: number = 0;

  @Input() blackPieces: number = 0;

  constructor() { }


  ngOnInit(): void {
  }

  drag(ev:DragEvent,isWhite:boolean){
    ev.dataTransfer?.setData('fromStack',this.stackNumber.toString());
    ev.dataTransfer?.setData('color',isWhite?'white':'black');
  }

  isDraggable(isWhite:boolean,n:number){

      if(isWhite)
        return n == this.whitePieces-1 && this.isLastMoveable;
      return n == this.blackPieces-1 && this.isLastMoveable;
    }
}
