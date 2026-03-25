export interface LoginRequest {
  email: string;
  password: string;
  remember: boolean;
}

export interface LoginData {
  accessToken: string;
  refreshToken: string;
  fullName: string;
  role: string;
  permissions: string[];
}

export interface AuthMeData {
  id: string;
  email: string;
  fullName: string;
  role: string;
  permissions: string[];
}

export interface RefreshTokenData {
  accessToken: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: LoginData;
  timestamp: string;
}

export interface JwtPayload {
  sub: string;
  exp: number;
  iat?: number;
  [key: string]: unknown;
}

