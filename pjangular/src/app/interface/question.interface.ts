// src/app/interface/question.interface.ts

// Enum QuestionType khớp với backend entity
export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  FILL_IN_THE_BLANK = 'FILL_IN_THE_BLANK',
  ESSAY = 'ESSAY',
  MATCHING = 'MATCHING',
  AUDIO_PROMPT = 'AUDIO_PROMPT',
  IMAGE_PROMPT = 'IMAGE_PROMPT',
  DICTATION = 'DICTATION' // Thêm nếu backend có (như trong ví dụ Postman của bạn)
}

// Interface đại diện cho QuestionResponse từ backend
export interface Question {
  questionId?: number; // Optional vì nó do backend tạo ra
  quizId: number;
  questionText: string;
  questionType: QuestionType;
  audioUrl?: string; // Đồng bộ với backend
  imageUrl?: string;  // Đồng bộ với backend
  correctAnswerText?: string; // Đồng bộ với backend
}

// Interface đại diện cho QuestionRequest từ backend
export interface QuestionRequest {
  quizId: number;
  questionText: string;
  questionType: QuestionType;
  audioUrl?: string;
  imageUrl?: string;
  correctAnswerText?: string;
}

// Interface đại diện cho QuestionSearchRequest từ backend
export interface QuestionSearchRequest {
  quizId?: number;
  questionText?: string;
  questionType?: QuestionType;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

// Interface đại diện cho QuestionPageResponse từ backend
export interface QuestionPageResponse {
  content: Question[];
  totalElements: number;
  totalPages: number;
  // Đã đổi tên 'page' thành 'currentPage' và 'size' thành 'pageSize' để khớp với backend DTO
  currentPage: number;
  pageSize: number;
}
