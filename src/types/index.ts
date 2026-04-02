export interface Block {
  id: string;      
  value: number;     
  color: string;     
  isSelected: boolean; 
}


export type GameGrid = (Block | null)[][];