import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, Dimensions } from 'react-native';
import { initializeGrid } from './src/logic/GridManager';
import { GRID_SIZE } from './src/constants/GameConfig';

const { width } = Dimensions.get('window');
const CELL_SIZE = (width - 40) / GRID_SIZE.COLUMNS; // Ekran genişliğine göre kare boyutu

export default function App() {
  // Senin yazdığın matrisi state olarak tutuyoruz
  const [grid] = useState(initializeGrid());

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gridBoard}>
        {grid.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.row}>
            {row.map((_, colIndex) => (
              <View 
                key={`cell-${rowIndex}-${colIndex}`} 
                style={styles.cell} 
              />
            ))}
          </View>
        ))}
      </View>
    </SafeAreaView>
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
    backgroundColor: '#334155', // Boş hücre içi (Hafif parlayan gri)
    margin: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569', // Hücre kenarlığı (Belirgin çizgiler)
  },
});