// src/app/interface/lesson.interface.ts

export enum Level {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

export enum Skill {
  LISTENING = 'LISTENING',
  SPEAKING = 'SPEAKING',
  READING = 'READING',
  WRITING = 'WRITING',
  VOCABULARY = 'VOCABULARY',
  GRAMMAR = 'GRAMMAR'
}

export interface Lesson {
  // `lessonId` là optional khi tạo mới, bắt buộc khi cập nhật/xóa
  lessonId?: number;
  title: string;
  description?: string; // Tùy chọn
  level: Level;
  skill: Skill;
  price: number; // THÊM MỚI: Giá của bài học
  createdAt?: string; // Tùy chọn, thường do backend tạo
  durationMonths?: number; // Tùy chọn
}
