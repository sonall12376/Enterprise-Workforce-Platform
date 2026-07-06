import api from '../../../services/api';
import { Task, TaskCreateInput, TaskUpdateInput, Assignee } from '../types/taskTypes';

export const taskService = {
  getTasks: async (
    projectId: string,
    filters?: { status?: string; priority?: string; assignedToId?: string }
  ): Promise<Task[]> => {
    const response = await api.get(`/projects/${projectId}/tasks`, { params: filters });
    return response.data.data;
  },

  getTask: async (projectId: string, taskId: string): Promise<Task> => {
    const response = await api.get(`/projects/${projectId}/tasks/${taskId}`);
    return response.data.data;
  },

  createTask: async (projectId: string, data: TaskCreateInput): Promise<Task> => {
    const response = await api.post(`/projects/${projectId}/tasks`, data);
    return response.data.data;
  },

  updateTask: async (projectId: string, taskId: string, data: TaskUpdateInput): Promise<Task> => {
    const response = await api.put(`/projects/${projectId}/tasks/${taskId}`, data);
    return response.data.data;
  },

  updateTaskStatus: async (
    projectId: string,
    taskId: string,
    status: 'Todo' | 'InProgress' | 'Review' | 'Done'
  ): Promise<Task> => {
    const response = await api.patch(`/projects/${projectId}/tasks/${taskId}/status`, { status });
    return response.data.data;
  },

  deleteTask: async (projectId: string, taskId: string): Promise<void> => {
    await api.delete(`/projects/${projectId}/tasks/${taskId}`);
  },

  getProjectMembers: async (projectId: string): Promise<Assignee[]> => {
    const response = await api.get(`/projects/${projectId}/tasks/members`);
    return response.data.data;
  },
};

export default taskService;
