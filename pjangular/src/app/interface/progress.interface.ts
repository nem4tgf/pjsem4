// src/app/interface/progress.interface.ts

// Vẫn giữ import này vì bạn có thể cần User và Lesson object để tìm tên/tiêu đề sau khi fetch dữ liệu.
import { Lesson } from "./lesson.interface";
import { User } from "./user.interface";

// THAY ĐỔI: Đổi tên enum Skill thành ActivityType và cập nhật các giá trị
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

export enum Status {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export interface Progress {
  progressId?: number; // progressId có thể là optional khi tạo mới/cập nhật, backend tự tạo/xác định
  userId: number;
  lessonId: number;
  // THAY ĐỔI: Thay thế 'skill' bằng 'activityType' và sử dụng enum ActivityType
  activityType: ActivityType;
  status: Status;
  completionPercentage?: number;
  lastUpdated?: string; // LocalDateTime được ánh xạ thành string
}
