import api from '../../../services/api';
import { Employee, EmployeeCreateInput, EmployeeUpdateInput, OrgMetadata } from '../types/employeeTypes';

export const employeeService = {
  getEmployees: async (filters?: { deptId?: string; status?: string; search?: string; page?: number; limit?: number }) => {
    const response = await api.get('/employees', { params: filters });
    return response.data.data; // contains { employees, pagination }
  },

  getEmployee: async (id: string): Promise<Employee> => {
    const response = await api.get(`/employees/${id}`);
    return response.data.data;
  },

  createEmployee: async (data: EmployeeCreateInput): Promise<Employee> => {
    const response = await api.post('/employees', data);
    return response.data.data;
  },

  updateEmployee: async (id: string, data: EmployeeUpdateInput): Promise<Employee> => {
    const response = await api.put(`/employees/${id}`, data);
    return response.data.data;
  },

  deleteEmployee: async (id: string): Promise<void> => {
    await api.delete(`/employees/${id}`);
  },

  getMetadata: async (): Promise<OrgMetadata> => {
    const response = await api.get('/employees/metadata');
    return response.data.data;
  },

  exportEmployees: async (): Promise<Blob> => {
    const response = await api.get('/employees/export', { responseType: 'blob' });
    return response.data;
  },
};

export default employeeService;
