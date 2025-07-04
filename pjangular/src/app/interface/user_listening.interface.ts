// src/app/interface/user-listening-attempt.interface.ts

// Interface đại diện cho dữ liệu gửi đi khi tạo một UserListeningAttempt (UserListeningAttemptRequest DTO)
export interface UserListeningAttemptRequest {
  userId: number;
  practiceActivityId: number;
  // ĐÃ XÓA: audioMaterialUrl (không còn trong backend DTO)
  userTranscribedText: string;
  // ĐÃ XÓA: actualTranscriptText (không còn trong backend DTO)
  accuracyScore: number;
}

// Interface đại diện cho dữ liệu nhận được từ backend cho một UserListeningAttempt (UserListeningAttemptResponse DTO)
export interface UserListeningAttempt {
  attemptId: number;
  userId: number;
  practiceActivityId: number;
  // ĐÃ XÓA: audioMaterialUrl (không còn trong backend DTO)
  userTranscribedText: string;
  // ĐÃ XÓA: actualTranscriptText (không còn trong backend DTO)
  accuracyScore: number;
  attemptDate: string;
}

// Interface cho yêu cầu tìm kiếm/phân trang UserListeningAttempt
export interface UserListeningAttemptSearchRequest {
  userId?: number;
  practiceActivityId?: number;
  minAccuracyScore?: number;
  maxAccuracyScore?: number;
  page?: number;
  size?: number;
  // ĐÃ XÓA: sortBy, sortDir, attemptDateFrom, attemptDateTo (backend xử lý sắp xếp mặc định và không có lọc theo ngày trong DTO search)
}

// Interface cho phản hồi phân trang UserListeningAttempt
export interface UserListeningAttemptPage {
  content: UserListeningAttempt[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  // Thêm các trường khác mà Spring Page trả về nếu cần, ví dụ:
  number: number; // Số trang hiện tại (0-indexed)
  first: boolean;
  last: boolean;
  empty: boolean;
}
