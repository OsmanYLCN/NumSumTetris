import { GRID_SIZE, NUMBER_COLORS} from '../constants/GameConfig';
import { GameGrid, Block } from '../types';

const createRandomBlock = (): Block => {
  const value = Math.floor(Math.random() * 9) + 1; 
  return {
    id: Math.random().toString(36).substring(2, 9),
    value: value,
    color: NUMBER_COLORS[value as keyof typeof NUMBER_COLORS],
    isSelected: false,
  };
};

export const initializeGrid = (): GameGrid => {
  const grid: GameGrid = [];

  for (let r = 0; r < GRID_SIZE.ROWS; r++) {
    const row = [];
    for (let c = 0; c < GRID_SIZE.COLUMNS; c++) {
      if (r >= GRID_SIZE.ROWS - 3) {
        row.push(createRandomBlock());
      } else {
        row.push(null);
      }
    }
    grid.push(row);
  }



  return grid;
};

export const applyGravity = (currentGrid: GameGrid): GameGrid => {
  
  const newGrid: GameGrid = currentGrid.map(row => [...row]);
  for (let r = GRID_SIZE.ROWS - 2; r >= 0; r--) {
    for (let c = 0; c < GRID_SIZE.COLUMNS; c++) {
      const currentBlock = newGrid[r][c];

      if(currentBlock !== null && newGrid[r + 1][c] === null) {
        newGrid[r + 1][c] = currentBlock;
        newGrid[r][c] = null;
      }
    }
  }
  
  return newGrid;
};

export const spawnNewBlock = (grid: GameGrid): GameGrid => {
  const newGrid = grid.map(row => [...row]);
  
  // Tepesi boş olan sütunların tespiti
  const availableColumns: number[] = [];
  for (let c = 0; c < GRID_SIZE.COLUMNS; c++) {
    if (newGrid[0][c] === null) {
      availableColumns.push(c);
    }
  }

  // Boş olan bloğun tepesine rastgele blok spawnlama
  if (availableColumns.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableColumns.length);
    const selectedColumn = availableColumns[randomIndex];
    
    newGrid[0][selectedColumn] = createRandomBlock();
  } 

  return newGrid;
};