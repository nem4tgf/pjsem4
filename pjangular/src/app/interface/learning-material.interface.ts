// src/app/interface/learning-material.interface.ts
// import { Lesson } from "./lesson.interface"; // CÓ THỂ BỎ DÒNG NÀY NẾU KHÔNG CÒN DÙNG TRỰC TIẾP

export enum MaterialType {
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  PDF = 'PDF'
}

export interface LearningMaterial {
  materialId?: number; // materialId là optional cho trường hợp tạo mới
  lessonId: number;    // <--- THAY ĐỔI TẠI ĐÂY: Chỉ cần lessonId
  materialType: MaterialType;
  materialUrl?: string;
  description?: string;
}
