export interface Flashcard {
  wordId: number;
  word: string;
  meaning: string;
  exampleSentence?: string;
  pronunciation?: string;
  audioUrl?: string;
  writingPrompt?: string;
  difficultyLevel?: string;
  isKnown: boolean;
}

export interface MarkFlashcardRequest {
  userId: number;
  wordId: number;
  isKnown: boolean;
}

export interface FlashcardSearchRequest {
  lessonId?: number;
  word?: string;
  meaning?: string;
  isKnown?: boolean;
  difficultyLevel?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

export interface FlashcardPage {
  content: Flashcard[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}
