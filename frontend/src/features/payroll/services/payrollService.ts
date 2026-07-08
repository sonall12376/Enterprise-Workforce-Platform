import api from '../../../services/api';

export const setupSalary = async (payload: {
  employeeId: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
}) => {
  const response = await api.post('/payroll/salary-setup', payload);
  return response.data;
};

export const calculatePayroll = async (payload: {
  employeeId: string;
  month: number;
  year: number;
}) => {
  const response = await api.post('/payroll/calculate', payload);
  return response.data;
};

export const getPayslips = async (params?: { employeeId?: string }) => {
  const response = await api.get('/payroll/payslips', { params });
  return response.data;
};

export const processPayroll = async (id: string, status: 'PendingApproval' | 'Approved' | 'Paid') => {
  const response = await api.patch(`/payroll/approve/${id}`, { status });
  return response.data;
};
