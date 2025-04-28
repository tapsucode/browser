// Shared types between renderer and main processes

export interface User {
  id: string;
  username: string;
  email?: string;
}

export interface AuthResponse {
  success: boolean;
  userId?: string;
  username?: string;
  error?: string;
}