// src/app/interface/stats.interface.ts

export interface Stats {
  userCount: number;
  vocabularyCount: number;
  lessonCount: number;
  quizCount: number;
  questionCount: number; // Số lượng câu hỏi tổng cộng
  quizResultCount: number; // Tổng số kết quả quiz đã hoàn thành

  // Phân phối dữ liệu theo các tiêu chí khác nhau
  userRoleDistribution?: { [key: string]: number }; // Ví dụ: { "ADMIN": 5, "USER": 100 }
  vocabularyDifficultyDistribution?: { [key: string]: number }; // Ví dụ: { "EASY": 50, "MEDIUM": 30, "HARD": 20 }
  lessonLevelDistribution?: { [key: string]: number }; // Ví dụ: { "BEGINNER": 10, "INTERMEDIATE": 8, "ADVANCED": 5 }
  lessonSkillDistribution?: { [key: string]: number }; // Ví dụ: { "VOCABULARY": 20, "GRAMMAR": 15, "READING": 10 }
}
