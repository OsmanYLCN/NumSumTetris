import { GRID_SIZE, NUMBER_COLORS} from '../constants/GameConfig';
import { GameGrid, Block } from '../types';

// İlk 3 satırda rastgele blok oluşturma fonksiyonu
const createRandomBlock = (): Block => {
  const value = Math.floor(Math.random() * 9) + 1; 
  return {
    id: Math.random().toString(36).substring(2, 9),
    value: value,
    color: NUMBER_COLORS[value as keyof typeof NUMBER_COLORS],
    isSelected: false,
  };
};

// Grid oluşturma fonksiyonu
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


// Yerçekimi fonksiyonu
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

// Yeni blok spawner fonksiyonu
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

// Ulaşılabilir rastgele bir hedef sayı belirleme fonksiyonu
export const generateTargetNumber = (grid: GameGrid): number => {
  const rows = GRID_SIZE.ROWS;
  const cols = GRID_SIZE.COLUMNS;

  // 1. Adım: Tüm dolu hücrelerin koordinatlarını bulalım
  const validCells: { r: number; c: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== null) validCells.push({ r, c });
    }
  }

  if (validCells.length < 2) return 0; // Ekranda yeterli blok yoksa 0 döndür

  // Dolu hücreleri karıştıralım ki her seferinde farklı bir noktadan başlayalım
  validCells.sort(() => Math.random() - 0.5);

  // Komşu yönleri (8 yön: yatay, dikey, çapraz)
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  // 2. Adım: Rastgele bir noktadan başlayıp 2 ila 4 blokluk bir yol (path) çizelim
  for (const startCell of validCells) {
    const targetLength = Math.floor(Math.random() * 3) + 2; // 2, 3 veya 4 seçer
    let currentPath = [startCell];
    let sum = grid[startCell.r][startCell.c]!.value;

    while (currentPath.length < targetLength) {
      const currentCell = currentPath[currentPath.length - 1];
      const neighbors: { r: number; c: number }[] = [];

      // Geçerli ve daha önce ziyaret edilmemiş komşuları bul
      for (const [dr, dc] of directions) {
        const nr = currentCell.r + dr;
        const nc = currentCell.c + dc;

        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] !== null) {
          const isVisited = currentPath.some(p => p.r === nr && p.c === nc);
          if (!isVisited) neighbors.push({ r: nr, c: nc });
        }
      }

      if (neighbors.length === 0) break; // Çıkmaz sokak, döngüden çık ve başka başlangıç dene

      // Rastgele bir komşuya git ve toplama ekle
      const nextCell = neighbors[Math.floor(Math.random() * neighbors.length)];
      currentPath.push(nextCell);
      sum += grid[nextCell.r][nextCell.c]!.value;
    }

    // Eğer hedeflediğimiz uzunluğa ulaştıysak bu toplamı hedef sayı yapabiliriz
    if (currentPath.length === targetLength) {
      return sum;
    }
  }

  // Eğer hiçbir yol bulunamazsa (çok nadir, bloklar kopuksa), en azından ilk iki bloğu toplayıp verelim
  return grid[validCells[0].r][validCells[0].c]!.value + grid[validCells[1].r][validCells[1].c]!.value;
};