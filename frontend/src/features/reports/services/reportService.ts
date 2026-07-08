import api from '../../../services/api';
import { ProjectStats, TaskStats, AssetStats, TicketStats, DashboardSummary } from '../types/reportTypes';

export const reportService = {
  getProjectStats: async (): Promise<ProjectStats> => {
    const response = await api.get('/reports/projects');
    return response.data.data;
  },

  getTaskStats: async (): Promise<TaskStats> => {
    const response = await api.get('/reports/tasks');
    return response.data.data;
  },

  getAssetStats: async (): Promise<AssetStats> => {
    const response = await api.get('/reports/assets');
    return response.data.data;
  },

  getTicketStats: async (): Promise<TicketStats> => {
    const response = await api.get('/reports/tickets');
    return response.data.data;
  },

  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const response = await api.get('/reports/dashboard');
    return response.data.data;
  },

  getEmployeeStats: async (): Promise<any> => {
    const response = await api.get('/reports/employees');
    return response.data.data;
  },

  getPayrollStats: async (): Promise<any> => {
    const response = await api.get('/reports/payroll');
    return response.data.data;
  },
};

export default reportService;
