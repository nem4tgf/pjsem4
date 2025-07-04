// src/app/interface/stats.interface.ts

// Interface đại diện cho dữ liệu thống kê nhận được từ backend
export interface Stats {
  userCount: number;
  vocabularyCount: number;
  lessonCount: number;
  quizCount: number;
  questionCount: number;    // Số lượng câu hỏi tổng cộng
  quizResultCount: number;  // Tổng số kết quả quiz đã hoàn thành

  // Phân phối dữ liệu theo các tiêu chí khác nhau
  // key sẽ là tên enum (ví dụ: "ROLE_ADMIN", "EASY", "BEGINNER", "VOCABULARY")
  // Giá trị là số lượng (number)
  userRoleDistribution?: { [key: string]: number };
  vocabularyDifficultyDistribution?: { [key: string]: number };
  lessonLevelDistribution?: { [key: string]: number };
  lessonSkillDistribution?: { [key: string]: number };
}
