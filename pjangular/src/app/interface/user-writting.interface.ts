// src/app/interface/user-writing-attempt.interface.ts

// Interface đại diện cho dữ liệu gửi đi khi tạo một UserWritingAttempt (UserWritingAttemptRequest DTO)
export interface UserWritingAttemptRequest {
  userId: number;
  practiceActivityId?: number;
  // ĐÃ XÓA: originalPromptText (không còn trong backend DTO)
  userWrittenText: string;
  grammarFeedback?: string;
  spellingFeedback?: string;
  cohesionFeedback?: string;
  overallScore?: number;
}

// Interface đại diện cho dữ liệu nhận được từ backend cho một UserWritingAttempt (UserWritingAttemptResponse DTO)
export interface UserWritingAttempt {
  attemptId: number;
  userId: number;
  practiceActivityId?: number;
  // ĐÃ XÓA: originalPromptText (không còn trong backend DTO)
  userWrittenText: string;
  grammarFeedback?: string;
  spellingFeedback?: string;
  cohesionFeedback?: string;
  overallScore?: number;
  attemptDate: string;
}

// Interface cho yêu cầu tìm kiếm/phân trang UserWritingAttempt
export interface UserWritingAttemptSearchRequest {
  userId?: number;
  practiceActivityId?: number;
  minOverallScore?: number;
  maxOverallScore?: number;
  page?: number;
  size?: number;
  // ĐÃ XÓA: sortBy, sortDir, attemptDateFrom, attemptDateTo
}

// Interface cho phản hồi phân trang UserWritingAttempt
export interface UserWritingAttemptPage {
  content: UserWritingAttempt[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
