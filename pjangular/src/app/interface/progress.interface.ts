// src/app/interface/progress.interface.ts

// Vẫn giữ import này vì bạn có thể cần User và Lesson object để tìm tên/tiêu đề sau khi fetch dữ liệu.
import { Lesson } from "./lesson.interface";
import { User } from "./user.interface";

export enum Skill {
  LISTENING = 'LISTENING',
  SPEAKING = 'SPEAKING',
  READING = 'READING',
  WRITING = 'WRITING',
  VOCABULARY = 'VOCABULARY',
  GRAMMAR = 'GRAMMAR'
}

export enum Status {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export interface Progress {
  progressId?: number; // progressId có thể là optional khi tạo mới/cập nhật, backend tự tạo/xác định
  userId: number;    // <--- SỬA ĐỔI QUAN TRỌNG: Backend chỉ nhận userId (number)
  lessonId: number;  // <--- SỬA ĐỔI QUAN TRỌNG: Backend chỉ nhận lessonId (number)
  skill: Skill;      // Skill là enum
  status: Status;    // Status là enum
  completionPercentage?: number;
  lastUpdated?: string; // LocalDateTime được ánh xạ thành string
}
