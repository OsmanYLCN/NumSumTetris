import { GRID_SIZE } from '../constants/GameConfig';
import { GameGrid } from '../types';


export const initializeGrid = (): GameGrid => {
  const grid: GameGrid = [];

  for (let r = 0; r < GRID_SIZE.ROWS; r++) {
    const row = [];
    for (let c = 0; c < GRID_SIZE.COLUMNS; c++) {
      row.push(null); // Başlangıçta her yer boş
    }
    grid.push(row);
  }

  return grid;
};