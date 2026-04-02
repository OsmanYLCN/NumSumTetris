import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions, Text } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeGrid, applyGravity } from './src/logic/GridManager';
import { GRID_SIZE } from './src/constants/GameConfig';

const { width } = Dimensions.get('window');
const CELL_SIZE = (width - 40) / GRID_SIZE.COLUMNS; // Ekran genişliğine göre kare boyutu

export default function App() {
  // Senin yazdığın matrisi state olarak tutuyoruz
  const [grid, setGrid] = useState(initializeGrid());

  useEffect(() => {
    // 5 saniyede bir (5000ms) yerçekimini çalıştır
    const gameLoop = setInterval(() => {
      setGrid(prevGrid => applyGravity(prevGrid));
    }, 5000);

    return () => clearInterval(gameLoop); // Uygulama kapanınca timer'ı temizle
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
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
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Derin lacivert/siyah (Arka Plan)
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridBoard: {
    padding: 8,
    backgroundColor: '#1E293B', // Yumuşak yüzey grisi (Oyun Alanı)
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    // Android için gölge
    elevation: 10,
    // iOS için gölge
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
    color: '#F8FAFC', // Parlak beyaz (Sayı metni)
    fontSize: 18,
    fontWeight: 'bold',
  },
});