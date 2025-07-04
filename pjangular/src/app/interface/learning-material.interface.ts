// src/app/interface/learning-material.interface.ts

export enum MaterialType {
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  PDF = 'PDF'
}

// Interface đại diện cho response từ backend (có materialId)
export interface LearningMaterial {
  materialId?: number; // materialId là optional vì nó do backend tạo ra
  lessonId: number;
  materialType: MaterialType;
  materialUrl: string;
  description?: string;
  transcriptText?: string; // THÊM MỚI: Đồng bộ với Backend
}

// Interface đại diện cho request gửi đi backend (không có materialId)
// Cái này khớp chính xác với LearningMaterialRequest DTO của backend
export interface LearningMaterialRequest {
  lessonId: number;
  materialType: MaterialType;
  materialUrl: string; // @NotBlank ở backend
  description?: string;
  transcriptText?: string; // THÊM MỚI: Đồng bộ với Backend
}

export interface LearningMaterialSearchRequest {
  lessonId?: number;
  materialType?: MaterialType | ''; // Cho phép rỗng để tìm kiếm tất cả
  description?: string;
  transcriptText?: string; // THÊM MỚI: Có thể tìm kiếm theo transcriptText
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

export interface LearningMaterialPage {
  content: LearningMaterial[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}
