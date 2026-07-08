import api from '../../../services/api';
import { Sprint } from '../types/taskTypes';

export const sprintService = {
  getSprints: async (projectId: string): Promise<Sprint[]> => {
    const response = await api.get(`/projects/${projectId}/sprints`);
    return response.data.data;
  },

  createSprint: async (projectId: string, data: any): Promise<Sprint> => {
    const response = await api.post(`/projects/${projectId}/sprints`, data);
    return response.data.data;
  },

  completeSprint: async (
    projectId: string,
    sprintId: string,
    fallbackSprintId?: string
  ): Promise<{ sprint: Sprint; rolloverCount: number }> => {
    const response = await api.post(`/projects/${projectId}/sprints/${sprintId}/complete`, { fallbackSprintId });
    return response.data;
  },

  deleteSprint: async (projectId: string, sprintId: string): Promise<void> => {
    await api.delete(`/projects/${projectId}/sprints/${sprintId}`);
  },
};

export default sprintService;
