// src/app/interface/flashcard.interface.ts
import { Vocabulary, DifficultyLevel } from "./vocabulary.interface";

// Tương ứng với backend DTO: UserFlashcardRequest
export interface UserFlashcardRequest {
  userId: number;
  wordId: number;
  isKnown: boolean;
}

// Tương ứng với backend DTO: FlashcardResponse
// (Bao gồm dữ liệu từ UserFlashcard và Vocabulary)
export interface Flashcard {
  userFlashcardId: number; // Tương ứng với userFlashcardId từ FlashcardResponse
  userId: number;         // Tương ứng với userId từ FlashcardResponse
  wordId: number;         // Tương ứng với wordId từ FlashcardResponse
  word: string;
  meaning: string;
  exampleSentence?: string;
  pronunciation?: string;
  audioUrl?: string;
  imageUrl?: string;
  writingPrompt?: string;
  difficultyLevel: DifficultyLevel; // Sử dụng enum đã import
  isKnown: boolean;
  lastReviewedAt?: string; // LocalDateTime từ backend -> string (ISO 8601)
  nextReviewAt?: string;   // LocalDateTime từ backend -> string (ISO 8601)
  reviewIntervalDays?: number;
  easeFactor?: number;
}

// Tương ứng với backend DTO: FlashcardSearchRequest
export interface FlashcardSearchRequest {
  userId?: number; // userId có thể là tùy chọn nếu không phải lúc nào cũng lọc theo user (nhưng trong component hiện tại thì cần)
  wordId?: number;
  setId?: number | null; // Đặt là null để cho phép chọn "Tất cả Flashcard"
  word?: string;
  meaning?: string;
  isKnown?: boolean | null; // Đặt là null để cho phép không lọc theo trạng thái đã biết/chưa biết
  difficultyLevel?: DifficultyLevel | null; // Đặt là null để cho phép không lọc theo độ khó
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

// Tương ứng với backend DTO: FlashcardPageResponse
export interface FlashcardPageResponse {
  content: Flashcard[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

// Tương ứng với backend DTO: FlashcardSetResponse
export interface FlashcardSet {
  setId: number;
  title: string;
  description?: string; // Tùy chọn
  creatorUserId?: number; // Tương ứng với creatorUserId từ backend, có thể null
  isSystemCreated: boolean;
  createdAt: string; // LocalDateTime từ backend -> string (ISO 8601)
  vocabularies?: Vocabulary[]; // Danh sách các từ vựng trong bộ
}

// Tương ứng với backend DTO: FlashcardSetRequest
export interface FlashcardSetRequest {
  title: string;
  description?: string; // Tùy chọn
  // Backend có creatorUserId và isSystemCreated trong FlashcardSetRequest
  // Điều này hơi lạ vì thường creatorUserId sẽ lấy từ JWT trên backend
  // và isSystemCreated thường được set tự động trên backend.
  // Tuy nhiên, nếu backend yêu cầu thì phải thêm vào.
  creatorUserId?: number; // Tùy chọn, nếu backend yêu cầu gửi
  isSystemCreated: boolean; // Bắt buộc, nếu backend yêu cầu gửi
  wordIds?: number[]; // Danh sách các wordId để thêm vào bộ (tùy chọn)
}

// Tương ứng với backend DTO: FlashcardSetSearchRequest
export interface FlashcardSetSearchRequest {
  title?: string;
  isSystemCreated?: boolean;
  creatorUserId?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

// Tương ứng với một FlashcardSetPageResponse trong backend nếu có
// (Backend của bạn có FlashcardPageResponse, nên giả định có FlashcardSetPageResponse tương tự)
export interface FlashcardSetPageResponse {
  content: FlashcardSet[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}
