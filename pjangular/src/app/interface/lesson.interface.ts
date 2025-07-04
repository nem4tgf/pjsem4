// src/app/interface/lesson.interface.ts

// Enum Level từ backend
export enum Level {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

// Enum Skill từ backend
export enum Skill {
  LISTENING = 'LISTENING',
  SPEAKING = 'SPEAKING',
  READING = 'READING',
  WRITING = 'WRITING',
  VOCABULARY = 'VOCABULARY',
  GRAMMAR = 'GRAMMAR',
  GENERAL = 'GENERAL'
}

// Interface đại diện cho LessonResponse từ backend
// Đây là dữ liệu mà chúng ta nhận được từ API
export interface Lesson {
  lessonId?: number; // Optional vì nó được tạo bởi backend
  title: string;
  description?: string;
  level: Level;
  skill: Skill;
  price: number; // BigDecimal của Java được map sang number trong TypeScript
  createdAt?: string; // LocalDateTime của Java được map sang string (ISO string format)
  isDeleted?: boolean; // THÊM MỚI: Đồng bộ với LessonResponse của backend
}

// Interface đại diện cho LessonRequest từ backend
// Đây là dữ liệu mà chúng ta gửi đi khi tạo hoặc cập nhật
export interface LessonRequest {
  title: string;
  description?: string;
  level: Level;
  skill: Skill;
  price: number;
}

// Interface đại diện cho LessonSearchRequest từ backend
export interface LessonSearchRequest {
  title?: string;
  level?: Level;
  skill?: Skill;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

// Interface đại diện cho LessonPageResponse từ backend
export interface LessonPageResponse {
  content: Lesson[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}
