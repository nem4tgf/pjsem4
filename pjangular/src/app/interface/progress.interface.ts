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
  progressId: number; // Đã bỏ dấu '?' để làm cho nó bắt buộc
  user: User;
  lesson: Lesson;
  skill: Skill;
  status: Status;
  completionPercentage?: number;
  lastUpdated?: string;
}
