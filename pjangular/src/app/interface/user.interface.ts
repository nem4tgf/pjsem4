export enum Role {
  ROLE_ADMIN = 'ROLE_ADMIN',
  ROLE_USER = 'ROLE_USER'
}

export interface User {
  userId: number; // Đã bỏ dấu '?' để làm cho nó bắt buộc
  username: string;
  email: string;
  password?: string;
  fullName?: string;
  avatarUrl?: string;
  createdAt?: string;
  otpCode?: string;
  otpExpiry?: string;
  role: Role;
}
