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
  quizId: number;
  lesson: Lesson; // Quan hệ ManyToOne với Lesson
  title: string;
  skill: Skill;
  createdAt?: string; // LocalDateTime được ánh xạ thành string
}
