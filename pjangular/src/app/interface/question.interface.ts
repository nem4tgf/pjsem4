// src/app/interface/question.interface.ts

// Không cần import { Quiz } từ './quiz.interface' nếu bạn chỉ muốn quizId ở đây.
// import { { Quiz } } from "./quiz.interface"; // <- Xóa dòng này nếu bạn không dùng Quiz object trực tiếp

import { Skill } from "./lesson.interface"; // Giả sử Skill được định nghĩa ở đây hoặc trong quiz.interface

export interface Question {
  questionId: number;
  quizId: number;         // THAY ĐỔI: Đây là thay đổi cốt lõi để khớp với backend DTO
  questionText: string;
  skill: Skill;
}
