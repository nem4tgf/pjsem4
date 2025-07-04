// src/app/interface/quiz.interface.ts

// Enum QuizType từ Quiz entity
export enum QuizType {
  GRAMMAR = 'GRAMMAR',
  VOCABULARY = 'VOCABULARY',
  COMPREHENSION = 'COMPREHENSION',
  LISTENING = 'LISTENING' // Nếu Quiz có thể là bài nghe riêng
}

// Tương ứng với QuizResponse của backend
export interface Quiz {
  quizId?: number; // Optional vì nó do backend tạo ra
  lessonId: number;
  title: string;
  quizType: QuizType; // ĐÃ THAY ĐỔI: từ skill sang quizType
  createdAt?: string; // LocalDateTime được ánh xạ thành string (ISO 8601), optional khi gửi request
}

// Tương ứng với QuizRequest của backend
export interface QuizRequest {
  lessonId: number;
  title: string;
  quizType: QuizType; // ĐÃ THAY ĐỔI: từ skill sang quizType
}

// Tương ứng với QuizSearchRequest của backend
export interface QuizSearchRequest {
  lessonId?: number | null; // Có thể là null hoặc undefined
  title?: string | null;    // Có thể là null hoặc undefined
  quizType?: QuizType | null; // ĐÃ THAY ĐỔI: từ skill sang quizType, có thể là null hoặc undefined
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

// Tương ứng với QuizPageResponse của backend
export interface QuizPageResponse {
  content: Quiz[];
  totalElements: number;
  totalPages: number;
  currentPage: number; // Tương ứng với 'page' của backend
  pageSize: number;    // Tương ứng với 'size' của backend
}
