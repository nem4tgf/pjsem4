import { Question } from "./question.interface";

export interface Answer {
  answerId?: number;
  questionId: number;
  content: string;
  isCorrect: boolean;
  isActive: boolean;
  isDeleted?: boolean; // Thêm trường isDeleted để xử lý xóa mềm
}

export interface AnswerSearchRequest {
  questionId?: number;
  isCorrect?: boolean;
  isActive?: boolean;
  answerText?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

export interface AnswerPage {
  content: Answer[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}
