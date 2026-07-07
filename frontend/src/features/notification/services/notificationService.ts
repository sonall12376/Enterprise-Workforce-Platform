import api from '../../../services/api';

export const getNotifications = async (params?: { all?: boolean }) => {
  const response = await api.get('/notifications', { params });
  return response.data;
};

export const markAsRead = async (id: string) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await api.post('/notifications/read-all');
  return response.data;
};
