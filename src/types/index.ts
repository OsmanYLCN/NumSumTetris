export interface Block {
  id: string;        // Her bloğun benzersiz kimliği
  value: number;     // 1-9 arası sayı değeri
  color: string;     // Sayıya atanmış sabit renk
  isSelected: boolean; // Seçilip seçilmediği bilgisi
}

// 8 sütun x 10 satırlık matris tipi
export type GameGrid = (Block | null)[][];