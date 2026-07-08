import api from '../../../services/api';
import { LoginResponse } from '../types';

export const loginApi = async (email: string, password: string, role: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    '/api/auth/login',
    { email, password, role }
  );
  return response.data;
};

export const signupApi = async (data: any) => {
  const response = await api.post('/auth/signup', data);
  return response.data;
};

export const forgotPasswordApi = async (email: string) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPasswordApi = async (token: string, password: string) => {
  const response = await api.post(`/auth/reset-password/${token}`, { password });
  return response.data;
};

export const changePasswordApi = async (currentPassword: string, newPassword: string) => {
  const response = await api.post('/auth/change-password', { currentPassword, newPassword });
  return response.data;
};
