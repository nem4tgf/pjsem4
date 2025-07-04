// src/app/interface/answer.interface.ts

// Interface cho Answer DTO (Response) - ĐÃ CẬP NHẬT để khớp CHÍNH XÁC với backend AnswerResponse
export interface Answer {
  answerId: number;
  questionId: number;
  content: string; // Đã là 'content' để khớp với JSON key từ @JsonProperty
  isCorrect: boolean;
  isActive: boolean;
  isDeleted: boolean; // Đã có để khớp với trường isDeleted trong backend AnswerResponse
}

// AnswerSearchRequest DTO (từ backend) - ĐÃ CẬP NHẬT để khớp với JSON key từ @JsonProperty
export interface AnswerSearchRequest {
  questionId?: number;
  content?: string; // Đã là 'content' để khớp với JSON key từ @JsonProperty
  isCorrect?: boolean;
  isActive?: boolean;
  isDeleted?: boolean; // THÊM MỚI: Khớp với trường isDeleted trong backend AnswerSearchRequest
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

// AnswerPage DTO (từ backend)
export interface AnswerPage {
  content: Answer[]; // Danh sách các Answer
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}
