import { Role } from "./user.interface"; // Đảm bảo import Role enum từ user.interface.ts

// Tương ứng với LoginRequest của backend
export interface LoginRequest {
  username: string; // @NotBlank ở backend
  password: string; // @NotBlank ở backend
}

// Tương ứng với LoginResponse của backend
export interface LoginResponse {
  token: string;
}

// Tương ứng với RegisterRequest của backend
export interface RegisterRequest {
  username: string; // @NotBlank ở backend
  password: string; // @NotBlank và @Size(min=6) ở backend
  email: string;    // @NotBlank và @Email ở backend
  fullName?: string; // THÊM MỚI: Từ backend RegisterRequest DTO (optional)
  role?: Role;       // THÊM MỚI: Từ backend RegisterRequest DTO (optional)
}

// Tương ứng với ResetPasswordRequest của backend
export interface ResetPasswordRequest {
  email: string;          // @NotBlank và @Email ở backend
  otp: string;            // @NotBlank ở backend
  newPassword: string; // @NotBlank và @Size(min=6) ở backend
}

// Tùy chọn: Interface cho yêu cầu gửi OTP (backend có phương thức sendOtpForPasswordReset(String email))
export interface ForgotPasswordRequest {
  email: string; // @NotBlank và @Email ở backend
}
export { Role };
