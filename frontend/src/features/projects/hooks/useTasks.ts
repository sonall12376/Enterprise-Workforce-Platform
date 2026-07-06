import { useState, useEffect, useCallback } from 'react';
import taskService from '../services/taskService';
import { Task, TaskCreateInput, TaskUpdateInput, Assignee } from '../types/taskTypes';

export const useTasks = (
  projectId: string,
  initialFilters?: { status?: string; priority?: string; assignedToId?: string }
) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Assignee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchTasks = useCallback(async (currentFilters = filters) => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await taskService.getTasks(projectId, currentFilters);
      setTasks(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, filters]);

  const fetchMembers = useCallback(async () => {
    if (!projectId) return;
    try {
      const data = await taskService.getProjectMembers(projectId);
      setMembers(data);
    } catch (err: any) {
      console.error('Failed to fetch project members:', err);
    }
  }, [projectId]);

  const addTask = async (data: TaskCreateInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const newTask = await taskService.createTask(projectId, data);
      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to create task';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const editTask = async (taskId: string, data: TaskUpdateInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedTask = await taskService.updateTask(projectId, taskId, data);
      setTasks((prev) => prev.map((task) => (task._id === taskId ? updatedTask : task)));
      return updatedTask;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to update task';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const changeTaskStatus = async (taskId: string, status: 'Todo' | 'InProgress' | 'Review' | 'Done') => {
    setError(null);
    try {
      const updatedTask = await taskService.updateTaskStatus(projectId, taskId, status);
      setTasks((prev) => prev.map((task) => (task._id === taskId ? updatedTask : task)));
      return updatedTask;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to update status';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const removeTask = async (taskId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await taskService.deleteTask(projectId, taskId);
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to delete task';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch tasks when filters or projectId changes
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, projectId, filters]);

  // Load members on mount
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers, projectId]);

  const updateFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  return {
    tasks,
    members,
    isLoading,
    error,
    filters,
    updateFilters,
    refetchTasks: fetchTasks,
    addTask,
    editTask,
    changeTaskStatus,
    removeTask,
  };
};

export default useTasks;
