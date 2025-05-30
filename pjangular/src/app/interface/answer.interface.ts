import { Question } from "./question.interface";

export interface Answer {
  answerId: number; // Đã bỏ dấu '?' để làm cho nó bắt buộc
  question: Question; // Quan hệ ManyToOne với Question
  answerText: string;
  isCorrect: boolean;
}
