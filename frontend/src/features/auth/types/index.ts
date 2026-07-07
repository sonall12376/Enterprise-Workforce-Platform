import { User } from '../../../context/AuthContext';

export interface LoginResponse {
  status: 'success' | 'error';
  message?: string;
  data: {
    accessToken: string;
    user: User;
  };
}

export interface ValidationErrorResponse {
  status: 'error';
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
}
