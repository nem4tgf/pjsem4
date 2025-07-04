// src/app/interface/user-speaking-attempt.interface.ts

// Interface đại diện cho dữ liệu gửi đi khi tạo một UserSpeakingAttempt (UserSpeakingAttemptRequest DTO)
export interface UserSpeakingAttemptRequest {
  userId: number;
  practiceActivityId: number;
  // ĐÃ XÓA: originalPromptText (không còn trong backend DTO)
  userAudioUrl: string;
  userTranscribedBySTT: string;
  pronunciationScore: number;
  fluencyScore?: number;
  overallScore: number;
}

// Interface đại diện cho dữ liệu nhận được từ backend cho một UserSpeakingAttempt (UserSpeakingAttemptResponse DTO)
export interface UserSpeakingAttempt {
  attemptId: number;
  userId: number;
  practiceActivityId: number;
  // ĐÃ XÓA: originalPromptText (không còn trong backend DTO)
  userAudioUrl: string;
  userTranscribedBySTT: string;
  pronunciationScore: number;
  fluencyScore?: number;
  overallScore: number;
  attemptDate: string;
}

// Interface cho yêu cầu tìm kiếm/phân trang UserSpeakingAttempt
export interface UserSpeakingAttemptSearchRequest {
  userId?: number;
  practiceActivityId?: number;
  minOverallScore?: number;
  maxOverallScore?: number;
  page?: number;
  size?: number;
  // ĐÃ XÓA: sortBy, sortDir, attemptDateFrom, attemptDateTo
}

// Interface cho phản hồi phân trang UserSpeakingAttempt
export interface UserSpeakingAttemptPage {
  content: UserSpeakingAttempt[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
