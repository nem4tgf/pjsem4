
import { Lesson } from "./lesson.interface"; 

export enum Skill {
  LISTENING = 'LISTENING',
  SPEAKING = 'SPEAKING',
  READING = 'READING',
  WRITING = 'WRITING',
  VOCABULARY = 'VOCABULARY',
  GRAMMAR = 'GRAMMAR'
}

export interface Quiz {
  quizId?: number; // quizId có thể optional khi tạo mới
  lessonId: number; // <--- SỬA ĐỔI QUAN TRỌNG: Backend chỉ nhận lessonId (number)
  title: string;
  skill: Skill;
  createdAt?: string; // LocalDateTime được ánh xạ thành string
}
