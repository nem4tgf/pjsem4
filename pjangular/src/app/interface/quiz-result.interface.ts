// src/app/interface/quiz-result.interface.ts

// Tương ứng với QuizResult của backend (QuizResultResponse DTO)
export interface QuizResult {
  resultId?: number; // Trong response, resultId sẽ luôn có; khi gửi request (update), có thể không có
  userId: number;
  quizId: number;
  score: number;
  completedAt?: string; // LocalDateTime được ánh xạ thành string (ISO 8601), optional khi gửi request
  durationSeconds?: number; // THÊM MỚI: Đồng bộ với backend DTO (có thể null nếu không cung cấp)
}

// Tương ứng với QuizResultRequest của backend
export interface QuizResultRequest {
  userId: number;
  quizId: number;
  score: number;
  durationSeconds?: number; // THÊM MỚI: Đồng bộ với backend DTO (có thể null nếu không cung cấp)
}

// Tương ứng với QuizResultSearchRequest của backend
export interface QuizResultSearchRequest {
  userId?: number;
  quizId?: number;
  minScore?: number; // Dùng number cho frontend
  maxScore?: number; // Dùng number cho frontend
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

// Tương ứng với QuizResultPageResponse của backend
export interface QuizResultPageResponse {
  content: QuizResult[];
  totalElements: number;
  totalPages: number;
  currentPage: number; // ĐÃ SỬA: Thay đổi từ 'page' thành 'currentPage' để khớp với backend
  pageSize: number;    // ĐÃ SỬA: Thay đổi từ 'size' thành 'pageSize' để khớp với backend
}
