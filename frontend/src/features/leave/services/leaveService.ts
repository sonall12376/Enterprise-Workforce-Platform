import api from '../../../services/api';

export const submitLeaveRequest = async (payload: {
  leaveType: 'Casual' | 'Sick' | 'Earned' | 'Unpaid';
  startDate: string;
  endDate: string;
  reason: string;
}) => {
  const response = await api.post('/leaves/request', payload);
  return response.data;
};

export const getLeaveRequests = async (params?: { employeeId?: string }) => {
  const response = await api.get('/leaves/requests', { params });
  return response.data;
};

export const getLeaveBalances = async (params?: { employeeId?: string }) => {
  const response = await api.get('/leaves/balance', { params });
  return response.data;
};

export const processLeaveRequest = async (id: string, status: 'Approved' | 'Rejected') => {
  const response = await api.patch(`/leaves/requests/${id}`, { status });
  return response.data;
};
