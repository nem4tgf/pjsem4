// src/app/interface/practice-activity.interface.ts

// Enum ActivitySkill từ PracticeActivity entity
export enum ActivitySkill {
    LISTENING = 'LISTENING',
    SPEAKING = 'SPEAKING',
    READING = 'READING',
    WRITING = 'WRITING',
    VOCABULARY = 'VOCABULARY',
    GRAMMAR = 'GRAMMAR',
    COMPREHENSION = 'COMPREHENSION' // Nếu bạn có loại này
}

// Enum ActivityType từ PracticeActivity entity
export enum ActivityType {
    TEXT = 'TEXT',          // Hoạt động dựa trên văn bản (đọc, viết)
    AUDIO = 'AUDIO',        // Hoạt động dựa trên âm thanh (nghe, nói)
    IMAGE = 'IMAGE',        // Hoạt động dựa trên hình ảnh
    MULTIPLE_CHOICE = 'MULTIPLE_CHOICE', // Hoạt động trắc nghiệm
    FILL_IN_THE_BLANK = 'FILL_IN_THE_BLANK', // Hoạt động điền vào chỗ trống
    MATCHING = 'MATCHING'   // Hoạt động nối
    // ... thêm các loại khác nếu cần
}

// Tương ứng với PracticeActivityResponse của backend
export interface PracticeActivity {
    activityId?: number; // Optional vì nó do backend tạo ra
    lessonId: number;
    title: string;
    description: string;
    activitySkill: ActivitySkill;
    activityType: ActivityType;
    contentUrl?: string | null; // URL của file audio/image hoặc tài liệu khác
    // Nếu có thêm các trường cụ thể cho từng loại hoạt động, có thể thêm ở đây hoặc trong các interface con
    createdAt?: string; // LocalDateTime được ánh xạ thành string (ISO 8601)
}

// Tương ứng với PracticeActivityRequest của backend
export interface PracticeActivityRequest {
    lessonId: number;
    title: string;
    description: string;
    activitySkill: ActivitySkill;
    activityType: ActivityType;
    contentUrl?: string | null;
}

// Tương ứng với PracticeActivityPageResponse của backend
export interface PracticeActivityPageResponse {
    content: PracticeActivity[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}
