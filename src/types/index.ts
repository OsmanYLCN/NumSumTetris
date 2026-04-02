// Block objesi tanımı ve özellikleri
export interface Block {
  id: string;      
  value: number;     
  color: string;     
  isSelected: boolean; 
}

// Grid tanımı 
export type GameGrid = (Block | null)[][];