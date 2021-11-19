import { Injectable } from '@angular/core';
import { TwoNums } from 'src/app/models/TwoNums';
import {Cell} from "../../models/Cell";

@Injectable({
  providedIn: 'root'
})
export class LogicService {

  constructor() { }

  private AvalableForPeace(nums : TwoNums,  currentCell : number , cellsWithMyPieces: Cell[], cellsWithOpPieces: Cell[]):TwoNums{ //if player is eaten must give back 0 in current cell
    cellsWithMyPieces.forEach(cell => {
      if(cell.numOfPieces > 0)
      cell.isMyPiece = false;
    });
    let cells : Cell[26]
    //making a commonCellsArray
    for (let i = 0; i < 26; i++) {
      if(cellsWithMyPieces[i].numOfPieces>0)
      {
        cells[i].numOfPieces= cellsWithMyPieces[i].numOfPieces;
        cells[i].isMyPiece = true;
      }
      else
      if(cellsWithOpPieces[i].numOfPieces>0)
      {
        cells[i].numOfPieces= cellsWithOpPieces[i].numOfPieces;
        cells[i].isMyPiece = false;
      }     
    }
    let avalbleNums : TwoNums
    if(cells[0].numOfPieces !=0)
      currentCell =0;

    let firstDestination =  nums.firstCube + currentCell;
    let secondDestination = nums.secondCube +currentCell;

    if(firstDestination < 24)
    {
      if(!(cells[firstDestination].isMyPiece || cells[firstDestination].numOfPieces <2 ))
        nums.firstCube = 0;
    }
    else
    if(!this.isAbleToTakeOutPiece(currentCell, nums.firstCube, cells))
      nums.firstCube = 0;

    if(secondDestination < 24)
    {
      if(!(cells[secondDestination].isMyPiece || cells[secondDestination].numOfPieces <2 ))
        nums.secondCube = 0;
    }
    else
    if(!this.isAbleToTakeOutPiece(currentCell, nums.secondCube, cells))
      nums.firstCube = 0;

      return nums;
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
