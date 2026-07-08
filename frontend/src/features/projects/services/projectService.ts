import api from '../../../services/api';
import { Project, ProjectCreateInput, ProjectUpdateInput, Manager } from '../types/projectTypes';

export const projectService = {
  getProjects: async (filters?: { status?: string; managerId?: string }): Promise<Project[]> => {
    const response = await api.get('/projects', { params: filters });
    return response.data.data;
  },

  getProject: async (id: string): Promise<Project> => {
    const response = await api.get(`/projects/${id}`);
    return response.data.data;
  },

  createProject: async (data: ProjectCreateInput): Promise<Project> => {
    const response = await api.post('/projects', data);
    return response.data.data;
  },

  updateProject: async (id: string, data: ProjectUpdateInput): Promise<Project> => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data.data;
  },

  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  getManagers: async (): Promise<Manager[]> => {
    const response = await api.get('/projects/managers');
    return response.data.data;
  },
};

export default projectService;
