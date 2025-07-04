// src/app/interface/user.interface.ts
import { RegisterRequest } from "./auth.interface";

export enum Role {
  ROLE_ADMIN = 'ROLE_ADMIN',
  ROLE_USER = 'ROLE_USER'
}

export interface User {
  userId: number; // Changed from optional to required to match UserResponse
  username: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  createdAt?: string; // LocalDateTime mapped to string (ISO 8601)
  role: Role;
}

export interface UserUpdateRequest {
  username?: string;
  email?: string;
  password?: string;
  fullName?: string;
  avatarUrl?: string;
  role?: Role;
}

export interface UserSearchRequest {
  username?: string;
  email?: string;
  fullName?: string;
  role?: Role;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

export interface UserPageResponse {
  content: User[];
  totalElements: number;
  totalPages: number;
  page: number; // Changed from currentPage to match backend
  size: number; // Changed from pageSize to match backend
}
