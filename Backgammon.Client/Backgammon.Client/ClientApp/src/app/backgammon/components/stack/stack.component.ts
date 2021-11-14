import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-stack',
  templateUrl: './stack.component.html',
  styleUrls: ['./stack.component.css']
})
export class StackComponent implements OnInit {

  @Input() stackNumber:number = 0;

  @Input() maxSize:number = 6;

  @Input() isBottom:boolean = false;

  @Input() isLastMoveable:boolean = false;

  @Input() whitePieces: number = 0;

  @Input() blackPieces: number = 0;

  constructor() { }


  ngOnInit(): void {
  }

  private color(){
    if(this.whitePieces)
      return 'white';
    if(this.blackPieces)
      return 'black';
    return undefined;
  }

  drag(ev:DragEvent){
    ev.dataTransfer?.setData('fromStack',this.stackNumber.toString());
    ev.dataTransfer?.setData('color',this.color()??'none');
  }

  isDraggable(n:number){
      return n == (Math.max(this.whitePieces,this.blackPieces)-1) && this.isLastMoveable;
    }

  getTransform(n:number){
    return `translate(${n*10}%, -${n}}%)`;
  }
}
