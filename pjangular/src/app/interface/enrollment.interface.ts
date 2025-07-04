import { Lesson } from "./lesson.interface";

export interface Enrollment {
  enrollmentId: number;
  userId: number;
  userName: string; // Khớp với EnrollmentResponse.userName
  lesson: Lesson; // Khớp với EnrollmentResponse.lesson (LessonResponse)
  enrollmentDate: string; // ISO string format (LocalDateTime trong backend)
  expiryDate: string; // ISO string format (ngày hết hạn từ backend)
  status: string; // "ACTIVE" hoặc "EXPIRED" từ backend
}

export interface EnrollmentRequest {
  userId: number; // Khớp với EnrollmentRequest.userId
  lessonId: number; // Khớp với EnrollmentRequest.lessonId
}

export interface EnrollmentSearchRequest {
  userId?: number; // Tiêu chí tìm kiếm theo userId
  lessonId?: number; // Tiêu chí tìm kiếm theo lessonId
  page?: number; // Phân trang
  size?: number; // Kích thước trang
  sortBy?: string; // Trường sắp xếp (enrollmentId, user.userId, lesson.lessonId, enrollmentDate)
  sortDir?: 'ASC' | 'DESC'; // Hướng sắp xếp
}

export interface EnrollmentPage {
  content: Enrollment[]; // Danh sách đăng ký
  totalElements: number; // Tổng số phần tử
  totalPages: number; // Tổng số trang
  page: number; // Trang hiện tại
  size: number; // Kích thước trang
}
