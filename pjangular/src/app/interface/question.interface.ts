import { Skill } from "./lesson.interface";
import { Quiz } from "./quiz.interface";

export interface Question {
  questionId: number; // Đã bỏ dấu '?' để làm cho nó bắt buộc
  quiz: Quiz;
  questionText: string;
  skill: Skill;
}
