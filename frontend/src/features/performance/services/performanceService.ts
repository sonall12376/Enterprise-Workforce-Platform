import api from '../../../services/api';

export const createGoal = async (payload: {
  employeeId: string;
  title: string;
  targetDate: string;
}) => {
  const response = await api.post('/performance/goals', payload);
  return response.data;
};

export const getGoals = async (params?: { employeeId?: string }) => {
  const response = await api.get('/performance/goals', { params });
  return response.data;
};

export const updateGoal = async (
  id: string,
  payload: { progress?: number; status?: 'NotStarted' | 'InProgress' | 'Achieved' | 'Deferred' }
) => {
  const response = await api.patch(`/performance/goals/${id}`, payload);
  return response.data;
};

export const createReview = async (payload: {
  employeeId: string;
  reviewPeriod: string;
  rating: number;
  feedback: string;
}) => {
  const response = await api.post('/performance/reviews', payload);
  return response.data;
};

export const getReviews = async (params?: { employeeId?: string }) => {
  const response = await api.get('/performance/reviews', { params });
  return response.data;
};

export const acknowledgeReview = async (id: string) => {
  const response = await api.patch(`/performance/reviews/${id}/acknowledge`);
  return response.data;
};
