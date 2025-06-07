// src/app/interface/answer.interface.ts

import { Question } from "./question.interface";

export interface Answer {
  answerId?: number;
  questionId: number; // Đã đổi từ question: Question;
  content: string;
  isCorrect: boolean;
  isActive: boolean;
}
