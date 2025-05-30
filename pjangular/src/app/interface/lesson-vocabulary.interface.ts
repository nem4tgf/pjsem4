// src/app/interface/lesson-vocabulary.interface.ts

// Interface cho payload gửi đi và dữ liệu trả về từ backend
// Nó phản ánh cấu trúc phẳng: { "lessonId": number, "wordId": number }
export interface LessonVocabulary {
  lessonId: number;
  wordId: number;
  // Bạn có thể thêm các trường khác nếu backend của bạn trả về chúng
  // Ví dụ: createdAt?: string;
  // Hoặc nếu backend khi lấy danh sách từ vựng theo bài học trả về thông tin đầy đủ của từ vựng,
  // bạn sẽ cần cập nhật interface này hoặc tạo một interface riêng cho response.
  // Tuy nhiên, dựa trên mô tả "Body 200 OK" của bạn, nó chỉ có lessonId và wordId.
}

// Interface này không còn cần thiết cho payload gửi đi, nhưng có thể giữ lại
// nếu bạn dùng nó cho các mục đích nội bộ khác hoặc định nghĩa một khóa chính.
// Đối với việc gửi dữ liệu, chúng ta sẽ dùng trực tiếp LessonVocabulary.
export interface LessonVocabularyId {
  lessonId: number;
  wordId: number;
}
