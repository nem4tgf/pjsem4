// src/app/interface/quiz-result.interface.ts

// Vẫn giữ import này vì bạn có thể cần User và Quiz object để tìm tên/tiêu đề sau khi fetch dữ liệu.
import { Quiz } from "./quiz.interface";
import { User } from "./user.interface";

export interface QuizResult {
  resultId?: number; // resultId có thể là optional khi tạo mới, backend tự tạo
  userId: number;    // <--- SỬA ĐỔI QUAN TRỌNG: Backend chỉ nhận userId (number)
  quizId: number;    // <--- SỬA ĐỔI QUAN TRỌNG: Backend chỉ nhận quizId (number)
  score: number;
  completedAt?: string; // LocalDateTime được ánh xạ thành string
}
