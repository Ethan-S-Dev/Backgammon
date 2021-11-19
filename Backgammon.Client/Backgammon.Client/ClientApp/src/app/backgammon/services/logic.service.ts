import { Injectable } from '@angular/core';
import { TwoNums } from 'src/app/models/TwoNums';
import {Cell} from "../../models/Cell";

@Injectable({
  providedIn: 'root'
})
export class LogicService {

  constructor() { }

  moveableFrom(nums:TwoNums,cellsWithMyPieces: number[], cellsWithOpPieces: number[]) :boolean[]{
    //making a commonCellsArray
    let cells:Cell[] = this.margeCells(cellsWithMyPieces,cellsWithOpPieces);

    let ret = cells.map((c,i)=>{
      if(!c.isMyPiece)
        return false;

      let moves = this.moveableToCheck(nums,cells,i);
      
      if(moves.firstCube == 0 && moves.secondCube == 0)
        return false

      return true;
    });

    return ret;
  }

  moveableTo(nums : TwoNums,  currentCell : number , cellsWithMyPieces: number[], cellsWithOpPieces: number[]):boolean[]{ //if player is eaten must give back 0 in current cell
    //making a commonCellsArray
    let cells:Cell[] = this.margeCells(cellsWithMyPieces,cellsWithOpPieces);

    // let availableNums : TwoNums;
    // if(cells[0].numOfPieces != 0)
    //   currentCell = 0;
    let moves = this.moveableToCheck(nums,cells,currentCell);
    return this.getMoveableTo(moves,currentCell);
  }

  private moveableToCheck(nums:TwoNums,cells:Cell[],currentCell:number):TwoNums{
    let firstDestination =  nums.firstCube + currentCell;
    let secondDestination = nums.secondCube + currentCell;

    if(firstDestination == currentCell)
      nums.firstCube = 0;
    else
    if(firstDestination < 25)
    {
      if(!(cells[firstDestination].isMyPiece || cells[firstDestination].numOfPieces <2 ))
        nums.firstCube = 0;
    }
    else
    if(!this.isAbleToTakeOutPiece(currentCell, nums.firstCube, cells))
      nums.firstCube = 0;


    if(secondDestination == currentCell)
      nums.secondCube = 0
    else
    if(secondDestination < 25)
    {
      if(!(cells[secondDestination].isMyPiece || cells[secondDestination].numOfPieces <2 ))
        nums.secondCube = 0;
    }
    else
    if(!this.isAbleToTakeOutPiece(currentCell, nums.secondCube, cells))
      nums.secondCube = 0;

    return nums;
  }

  private margeCells(cellsWithMyPieces: number[], cellsWithOpPieces: number[]){
    return cellsWithMyPieces.map((n,i)=>{
      if(n>0)
        return {numOfPieces:n,isMyPiece:true};
      
      if(cellsWithOpPieces[i] > 0)
        return {numOfPieces:cellsWithOpPieces[i],isMyPiece:false}

      return {numOfPieces:0,isMyPiece:false}
    });
  }

  private getMoveableTo(twoNums:TwoNums,current:number):boolean[]{
    let ret = [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false];

    if(twoNums.firstCube > 0)
      ret[current + twoNums.firstCube] = true;

    if(twoNums.secondCube > 0)
      ret[current + twoNums.secondCube] = true;

    return ret;
  }

  private isAllPiecesAtTheEnd(cells: Cell[]):boolean{
    for (let index = 0; index < 19; index++) {
     if(cells[index].isMyPiece)
      return false;
    } 
     return true;    
  }

  private isAbleToTakeOutPiece(currentLocation:number , numOfSteps:number, cells : Cell[]):boolean
  {
    if(!this.isAllPiecesAtTheEnd(cells))
    return false;
    if(numOfSteps + currentLocation == 25)
    return true;
   
    for (let i = 19; i < currentLocation; i++) {
      if(cells[i].isMyPiece)
        return false;
      
    }
    return true;
  }
  

}
