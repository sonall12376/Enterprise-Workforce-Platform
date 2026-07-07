import api from '../../../services/api';
import { LoginResponse } from '../types';

export const loginApi = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', { email, password });
  return response.data;
};
