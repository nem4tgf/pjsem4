// src/app/interface/lesson-vocabulary.interface.ts

// Interface đại diện cho dữ liệu gửi đi khi thêm mối quan hệ Lesson-Vocabulary
// Tương ứng với LessonVocabularyRequest DTO của backend
export interface LessonVocabularyRequest {
  lessonId: number; // @NotNull ở backend
  wordId: number;   // @NotNull ở backend
}

// Interface đại diện cho dữ liệu trả về sau khi tạo/lấy mối quan hệ Lesson-Vocabulary
// Tương ứng với LessonVocabularyResponse DTO của backend
export interface LessonVocabularyResponse {
  lessonId: number;
  wordId: number;
  // Bạn có thể thêm các trường khác ở đây nếu backend trả về, ví dụ: createdAt?: string;
}

// Interface LessonVocabulary chung có thể được sử dụng khi hiển thị danh sách
// hoặc khi cần một kiểu để biểu diễn một mục Lesson-Vocabulary.
// Nó giống LessonVocabularyResponse.
export interface LessonVocabulary {
  lessonId: number;
  wordId: number;
}
