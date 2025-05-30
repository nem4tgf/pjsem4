import { Quiz } from "./quiz.interface";
import { User } from "./user.interface";

export interface QuizResult {
  resultId: number; // Đã bỏ dấu '?' để làm cho nó bắt buộc
  user: User;
  quiz: Quiz;
  score: number;
  completedAt?: string;
}
