// src/app/interface/user.interface.ts

export enum Role {
  ROLE_ADMIN = 'ROLE_ADMIN',
  ROLE_USER = 'ROLE_USER'
}

export interface User {
  userId?: number; // Optional khi tạo mới, bắt buộc khi cập nhật/xóa
  username: string;
  email: string;
  password?: string; // Optional: chỉ cần khi tạo user, hoặc khi thay đổi mật khẩu (qua API riêng)
  fullName?: string;
  avatarUrl?: string;
  createdAt?: string; // Optional: backend tạo
  // Các trường khác như otpCode, otpExpiry không cần thiết cho giao diện quản lý này,
  // nhưng nếu có trong response từ backend thì Angular sẽ tự động map nếu tên trường giống nhau.
  role: Role;
}
