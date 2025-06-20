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
  level: Level | string;
  skill: Skill | string;
  price: number; // Added price
  createdAt?: string;
  durationMonths?: number;
}

// LessonRequest DTO for creating/updating lessons, excluding backend-managed fields like createdAt
export interface LessonRequest {
  title: string;
  description?: string;
  level: string;
  skill: string;
  price: number; // Added price
}

export interface LessonSearchRequest {
  title?: string;
  level?: string;
  skill?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

// Renamed from LessonPage to LessonPageResponse to match backend DTO
// Adjusted page and size to pageNo and pageSize for consistency with backend
export interface LessonPageResponse {
  content: Lesson[];
  totalElements: number;
  totalPages: number;
  pageNo: number; // Changed from 'page'
  pageSize: number; // Changed from 'size'
  last?: boolean; // Optional: Backend's Page object often includes 'last'
}
