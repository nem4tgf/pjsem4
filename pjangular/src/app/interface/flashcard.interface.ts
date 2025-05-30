export interface Flashcard {
  id: number; // Đã bỏ dấu '?' để làm cho nó bắt buộc
  userId: number;
  wordId: number;
  isKnown: boolean;
}
