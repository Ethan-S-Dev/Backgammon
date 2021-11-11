import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'enumerate'
})
export class EnumeratePipe implements PipeTransform {

  transform(n: number,from:number|undefined = undefined,to:number|undefined=undefined,reverse:boolean=false): number[] {
    if(n <= 0)
      return [];
    if(reverse)
      return[...Array(n)].map((_,i) => i).slice(from,to).reverse();
    return [...Array(n)].map((_,i) => i).slice(from,to);
  }

}
