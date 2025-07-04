// src/app/interface/progress.interface.ts

// Enum ActivityType khớp với backend entity
export enum ActivityType {
  READING_MATERIAL = 'READING_MATERIAL',
  FLASHCARDS = 'FLASHCARDS',
  QUIZ = 'QUIZ',
  LISTENING_PRACTICE = 'LISTENING_PRACTICE',
  SPEAKING_EXERCISE = 'SPEAKING_EXERCISE',
  WRITING_TASK = 'WRITING_TASK',
  GRAMMAR_EXERCISE = 'GRAMMAR_EXERCISE',
  VOCABULARY_BUILDER = 'VOCABULARY_BUILDER'
}

// Enum Status khớp với backend entity
export enum Status {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

// Tương ứng với ProgressResponse của backend
export interface Progress {
  progressId?: number; // Trong response, progressId sẽ có; khi gửi request (như update), có thể không có
  userId: number;
  lessonId: number;
  activityType: ActivityType;
  status: Status;
  completionPercentage: number; // @NotNull ở backend
  lastUpdated?: string; // LocalDateTime được ánh xạ thành string (ISO 8601), có thể optional khi gửi request
}

// Tương ứng với ProgressRequest của backend
// Đây là DTO chính xác mà backend mong đợi khi tạo/cập nhật
export interface ProgressRequest {
  userId: number;
  lessonId: number;
  activityType: ActivityType;
  status: Status;
  completionPercentage: number;
}

// Tương ứng với ProgressSearchRequest của backend
export interface ProgressSearchRequest {
  userId?: number;
  lessonId?: number;
  activityType?: ActivityType;
  status?: Status;
  minCompletionPercentage?: number;
  maxCompletionPercentage?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

// Tương ứng với ProgressPageResponse của backend
export interface ProgressPageResponse {
  content: Progress[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}
