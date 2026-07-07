import api from '../../../services/api';
import { Coordinates } from '../types';

export const clockIn = async (coordinates?: Coordinates) => {
  const response = await api.post('/attendance/clock-in', { coordinates });
  return response.data;
};

export const clockOut = async () => {
  const response = await api.post('/attendance/clock-out');
  return response.data;
};

export const getLogs = async (params?: { page?: number; limit?: number; employeeId?: string }) => {
  const response = await api.get('/attendance/logs', { params });
  return response.data;
};

export const submitCorrection = async (payload: {
  attendanceId: string;
  requestedClockIn: string;
  requestedClockOut: string;
  reason: string;
}) => {
  const response = await api.post('/attendance/correction', payload);
  return response.data;
};

export const getCorrections = async () => {
  const response = await api.get('/attendance/corrections');
  return response.data;
};

export const processCorrection = async (id: string, status: 'Approved' | 'Rejected') => {
  const response = await api.patch(`/attendance/corrections/${id}`, { status });
  return response.data;
};
