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
  lessonId?: number;
  title: string;
  description?: string;
  level: Level;
  skill: Skill;
  price: number;
  createdAt?: string;
  durationMonths?: number;
}

export interface LessonRequest {
  title: string;
  description?: string;
  level: Level;
  skill: Skill;
  price: number;
}

export interface LessonSearchRequest {
  title?: string;
  level?: Level;
  skill?: Skill;
  minPrice?: number;
  maxPrice?: number;
  pageNo?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

export interface LessonPageResponse {
  content: Lesson[];
  totalElements: number;
  totalPages: number;
  pageNo: number;
  pageSize: number;
  last?: boolean;
}
