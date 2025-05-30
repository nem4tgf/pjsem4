
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
  lessonId: number; // Đã bỏ dấu '?' để làm cho nó bắt buộc
  title: string;
  description?: string; // Giữ nguyên tùy chọn
  level: Level;
  skill: Skill;
  createdAt?: string; // Giữ nguyên tùy chọn
}
