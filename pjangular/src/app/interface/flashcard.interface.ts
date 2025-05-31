// src/app/interface/flashcard.interface.ts

// Đây là cấu trúc dữ liệu mà API GET /flashcards/lesson/{lessonId}/user/{userId} đang trả về
// Nó trông giống Vocabulary có thêm isKnown
export interface Flashcard {
  wordId: number;
  word: string; // Tên cũ là 'frontText'
  meaning: string; // Tên cũ là 'backText'
  exampleSentence?: string;
  pronunciation?: string;
  audioUrl?: string;
  writingPrompt?: string;
  difficultyLevel?: string;
  isKnown: boolean; // Trạng thái flashcard cho người dùng
}

// Đây là cấu trúc dữ liệu mà API POST /flashcards/mark đang mong đợi
export interface MarkFlashcardRequest {
  id: number; // Đây có vẻ là flashcardId hoặc userFlashcardId, cần xác nhận lại từ backend
  userId: number;
  wordId: number;
  isKnown: boolean;
}

// interface User và Vocabulary (Nếu bạn chưa có)
// src/app/interface/user.interface.ts
export interface User {
  userId: number;
  username: string;
  // ... các trường khác
}

// src/app/interface/vocabulary.interface.ts
export interface Vocabulary {
  wordId: number;
  word: string;
  meaning: string;
  // ... các trường khác
}
