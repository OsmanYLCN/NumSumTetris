// İmportlar
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeGrid, applyGravity, spawnNewBlock, generateTargetNumber } from './src/logic/GridManager';
import { GRID_SIZE } from './src/constants/GameConfig';

// Ana app kodları
const { width } = Dimensions.get('window');
const CELL_SIZE = (width - 40) / GRID_SIZE.COLUMNS; 
export default function App() {
  const [grid, setGrid] = useState(initializeGrid());
  const [isGameOver, setIsGameOver] = useState(false);
  const [targetNumber, setTargetNumber] = useState(0);
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Oyun ilk yüklendiğinde hedef sayıyı belirle
  useEffect(() => {
    setTargetNumber(generateTargetNumber(grid));
  }, []);

  
  useEffect(() => {
  if (isGameOver) return;

  let tickCounter = 0;
  const gameLoop = setInterval(() => {
    tickCounter++;
    
    setGrid(prevGrid => {
      let updatedGrid = applyGravity(prevGrid);
      const isColumnFull = updatedGrid[0].some(cell => cell !== null);
      
      if (isColumnFull) {
        setIsGameOver(true);
        return updatedGrid;
      }    
      if (tickCounter % 5 === 0) {
        updatedGrid = spawnNewBlock(updatedGrid);
      }

      return updatedGrid;
    });
  }, 1000);

  return () => clearInterval(gameLoop);
}, [isGameOver]);

  // Blok tıklama işleyicisi
  const handleBlockPress = (rowIndex: number, colIndex: number) => {
    const clickedBlock = grid[rowIndex][colIndex];
    if (!clickedBlock) return; // Boş hücreye tıklandıysa çık

    // 1. Zaten seçiliyse (Sadece en son seçileni geri alabilme kuralı)
    if (clickedBlock.isSelected) {
      if (selectedBlockIds.length > 0 && selectedBlockIds[selectedBlockIds.length - 1] === clickedBlock.id) {
        setSelectedBlockIds(prev => prev.slice(0, -1)); // Son ID'yi listeden çıkar
        setGrid(prevGrid => {
          const newGrid = prevGrid.map(row => [...row]);
          // Bloğun yeni yerini bulup isSelected değerini false yapıyoruz (yerçekimine karşı güvenli)
          for (let r = 0; r < newGrid.length; r++) {
            for (let c = 0; c < newGrid[r].length; c++) {
              if (newGrid[r][c]?.id === clickedBlock.id) {
                newGrid[r][c] = { ...newGrid[r][c]!, isSelected: false };
              }
            }
          }
          return newGrid;
        });
      }
      return; // Daha eski bir bloğa tıkladıysa hiçbir şey yapma
    }

    // 2. Maksimum 4 blok seçilebilir kuralı
    if (selectedBlockIds.length >= 4) return;

    // 3. Komşuluk kuralı (Eğer listede daha önce seçilmiş blok varsa)
    if (selectedBlockIds.length > 0) {
      const lastSelectedId = selectedBlockIds[selectedBlockIds.length - 1];
      let lastR = -1, lastC = -1;
      
      // En son seçilen bloğun *şu anki* koordinatlarını bul
      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
          if (grid[r][c]?.id === lastSelectedId) {
            lastR = r; lastC = c;
          }
        }
      }

      // Bulunduysa komşu mu diye bak
      if (lastR !== -1 && lastC !== -1) {
        const rowDiff = Math.abs(lastR - rowIndex);
        const colDiff = Math.abs(lastC - colIndex);
        
        // Komşu demek: satır ve sütun farkı en fazla 1 olacak ve ikisi de aynı anda 0 olmayacak
        const isNeighbor = rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
        if (!isNeighbor) return; // Komşu değilse fonksiyondan çık, seçime izin verme
      }
    }

    // 4. Tüm kurallar geçildi, bloğu seçime ekle ve rengini parlat
    setSelectedBlockIds(prev => [...prev, clickedBlock.id]);
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row => [...row]);
      for (let r = 0; r < newGrid.length; r++) {
        for (let c = 0; c < newGrid[r].length; c++) {
          if (newGrid[r][c]?.id === clickedBlock.id) {
            newGrid[r][c] = { ...newGrid[r][c]!, isSelected: true };
          }
        }
      }
      return newGrid;
    });
  };

  // Onayla butonu işleyicisi
  const handleConfirm = () => {
    let sum = 0; // Toplamı tutacağımız geçici değişken
    const selectedBlocksPositions: { r: number; c: number }[] = []; 

    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        const block = grid[r][c];
        if (block && selectedBlockIds.includes(block.id)) {
          sum += block.value;
          selectedBlocksPositions.push({ r, c });
        }
      }
    }

    // 2. Matematik Kontrolü: Toplam, hedef sayıya eşit mi?
    if (sum === targetNumber) {
      // DURUM 1: DOĞRU BİLDİ! (Bloklar patlayacak)
      setGrid(prevGrid => {
        const newGrid = prevGrid.map(row => [...row]);

        selectedBlocksPositions.forEach(pos => {
          newGrid[pos.r][pos.c] = null;
        });

        setTargetNumber(generateTargetNumber(newGrid));
        
        return newGrid; // Ekranı yeni grid ile güncelle
      });
    } else {
      // DURUM 2: YANLIŞ BİLDİ! (Hatalı İşlem yazısı göster ve seçimleri iptal et)
      
      setErrorMessage('HATALI İŞLEM');
      setTimeout(() => {
        setErrorMessage(null);
      }, 700);

      setGrid(prevGrid => {
        return prevGrid.map(row => row.map(block => {
        
          return block && selectedBlockIds.includes(block.id) ? { ...block, isSelected: false } : block;
        }));
      });
    }

    
    setSelectedBlockIds([]);
  };

  return (
  <SafeAreaProvider>
    <SafeAreaView style={styles.container}>
      {isGameOver ? (
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverText}>GAME OVER</Text>
          
          <TouchableOpacity 
            style={styles.restartButton} 
            onPress={() => {
              const newGrid = initializeGrid();
              setGrid(newGrid);
              setTargetNumber(generateTargetNumber(newGrid));
              setSelectedBlockIds([]); 
              setIsGameOver(false);
            }}
          >
            <Text style={styles.restartText}>Yeniden Başla</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.headerContainer}>
            <Text style={styles.targetLabel}>HEDEF SAYI</Text>
            <Text style={styles.targetNumber}>{targetNumber}</Text>
          </View>
        <View style={styles.gridBoard}>
          {grid.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.row}>
              {row.map((block, colIndex) => (
                <TouchableOpacity 
                  key={`cell-${rowIndex}-${colIndex}`} 
                  activeOpacity={0.8}
                  onPress={() => handleBlockPress(rowIndex, colIndex)}
                  style={[
                    styles.cell, 
                    block ? { backgroundColor: block.color } : null,
                    block?.isSelected && styles.selectedCell
                  ]}
                >
                  {block && (
                    <Text style={[styles.blockText, block.isSelected && styles.selectedBlockText]}>
                      {block.value}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
        
        {/* ONAYLA BUTONU */}
        <TouchableOpacity 
          style={[styles.confirmButton, selectedBlockIds.length >= 2 ? styles.confirmButtonActive : null]}
          disabled={selectedBlockIds.length < 2}
          onPress={handleConfirm}
        >
          <Text style={styles.confirmText}>ONAYLA</Text>
        </TouchableOpacity>

        {/* HATA MESAJI (TOAST) */}
        {errorMessage && (
          <View style={styles.errorToast}>
            <Text style={styles.errorToastText}>{errorMessage}</Text>
          </View>
        )}
        </>
      )}
    </SafeAreaView>
  </SafeAreaProvider>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'flex-start', 
    paddingTop: 60,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  targetLabel: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  targetNumber: {
    color: '#38BDF8',
    fontSize: 56,
    fontWeight: '900',
  },
  gridBoard: {
    padding: 8,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE - 4,
    height: CELL_SIZE - 4,
    backgroundColor: '#334155', 
    margin: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#475569', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockText: {
    color: '#F8FAFC', 
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedCell: {
    borderWidth: 3,
    borderColor: '#F8FAFC',
    transform: [{ scale: 0.9 }], 
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  selectedBlockText: {
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  confirmButton: {
    marginTop: 30,
    backgroundColor: '#475569', 
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  confirmButtonActive: {
    backgroundColor: '#10B981', 
  },
  confirmText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },
  gameOverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A', 
  },
  gameOverText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#EF4444', 
    marginBottom: 20,
  },
  restartButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  restartText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  errorToast: {
    position: 'absolute',
    top: '45%', // Ekranın ortasına yakın
    backgroundColor: 'rgba(239, 68, 68, 0.95)', // Tailwind Red-500 rengi ve %95 opaklık
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    zIndex: 100, // Diğer tüm bileşenlerin üstünde durması için
    elevation: 10,
  },
  errorToastText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },
});