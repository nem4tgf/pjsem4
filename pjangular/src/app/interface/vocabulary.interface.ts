// src/app/interface/vocabulary.interface.ts

// Enum DifficultyLevel từ backend
export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

// Interface đại diện cho Vocabulary (tương ứng với VocabularyResponse/VocabularyDTO của backend)
// Đây là dữ liệu chúng ta nhận được từ API
export interface Vocabulary {
  wordId?: number; // Optional vì backend tự tạo
  word: string;
  meaning: string;
  exampleSentence?: string;
  pronunciation?: string;
  audioUrl?: string;
  imageUrl?: string;
  writingPrompt?: string;
  difficultyLevel: DifficultyLevel;
}

// Interface đại diện cho VocabularyRequest từ backend
// Đây là dữ liệu chúng ta gửi đi khi tạo hoặc cập nhật
export interface VocabularyRequest {
  word: string;
  meaning: string;
  exampleSentence?: string;
  pronunciation?: string;
  audioUrl?: string;
  imageUrl?: string;
  writingPrompt?: string;
  difficultyLevel: DifficultyLevel;
}

// Interface đại diện cho VocabularySearchRequest từ backend
export interface VocabularySearchRequest {
  word?: string;
  meaning?: string;
  difficultyLevel?: DifficultyLevel;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

// Interface cho phản hồi phân trang các từ vựng
export interface VocabularyPage {
  content: Vocabulary[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}
