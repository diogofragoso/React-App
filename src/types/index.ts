// Arquivo: src/types/index.ts
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  userTypeId?: number;
  role?: string;
}

export interface LoginResponse {
  token?: string;
  user: User;
}

export interface Cliente {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface ClienteInput {
  name: string;
  email: string;
}

export interface ApiError {
  error?: string;
  message?: string;
  errors?: { path: string; message: string }[];
}

export interface CreateUserInput {
  name?: string;
  email: string;
  password: string;
  userTypeId: number;
}

export interface UserTypeOption {
  id: number;
  code: string;
  name: string;
}
