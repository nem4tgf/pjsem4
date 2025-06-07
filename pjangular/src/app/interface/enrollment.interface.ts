// src/app/interface/enrollment.interface.ts

export interface Enrollment {
  enrollmentId: number;
  userId: number;
  userName: string;
  lessonId: number;
  lessonTitle: string;
  enrollmentDate: string; // ISO string format
  expiryDate: string;   // ISO string format
}
