export enum MaterialType {
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  PDF = 'PDF'
}

export interface LearningMaterial {
  materialId?: number;
  lessonId: number;
  materialType: MaterialType;
  materialUrl?: string;
  description?: string;
}

export interface LearningMaterialSearchRequest {
  lessonId?: number;
  materialType?: MaterialType | '';
  description?: string;
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
