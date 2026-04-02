// İmportlar
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeGrid, applyGravity, spawnNewBlock } from './src/logic/GridManager';
import { GRID_SIZE } from './src/constants/GameConfig';

// Ana app kodları
const { width } = Dimensions.get('window');
const CELL_SIZE = (width - 40) / GRID_SIZE.COLUMNS; 
export default function App() {
  const [grid, setGrid] = useState(initializeGrid());
  const [isGameOver, setIsGameOver] = useState(false);

  
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

  return (
  <SafeAreaProvider>
    <SafeAreaView style={styles.container}>
      {isGameOver ? (
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverText}>GAME OVER</Text>
          
          <TouchableOpacity 
            style={styles.restartButton} 
            onPress={() => {
              setGrid(initializeGrid());
              setIsGameOver(false);
            }}
          >
            <Text style={styles.restartText}>Yeniden Başla</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.gridBoard}>
          {grid.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.row}>
              {row.map((block, colIndex) => (
                <View 
                  key={`cell-${rowIndex}-${colIndex}`} 
                  style={[
                    styles.cell, 
                    block ? { backgroundColor: block.color } : null 
                  ]}
                >
                  {block && (
                    <Text style={styles.blockText}>{block.value}</Text>
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>
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
    justifyContent: 'center',
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
});