import { useState, useEffect, useCallback } from 'react';
import projectService from '../services/projectService';
import { Project, ProjectCreateInput, ProjectUpdateInput, Manager } from '../types/projectTypes';

export const useProjects = (initialFilters?: { status?: string; managerId?: string }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchProjects = useCallback(async (currentFilters = filters) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await projectService.getProjects(currentFilters);
      setProjects(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchManagers = useCallback(async () => {
    try {
      const data = await projectService.getManagers();
      setManagers(data);
    } catch (err: any) {
      console.error('Failed to fetch managers:', err);
    }
  }, []);

  const addProject = async (data: ProjectCreateInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const newProject = await projectService.createProject(data);
      setProjects((prev) => [newProject, ...prev]);
      return newProject;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to create project';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const editProject = async (id: string, data: ProjectUpdateInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedProject = await projectService.updateProject(id, data);
      setProjects((prev) =>
        prev.map((proj) => (proj._id === id ? updatedProject : proj))
      );
      return updatedProject;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to update project';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const removeProject = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await projectService.deleteProject(id);
      setProjects((prev) => prev.filter((proj) => proj._id !== id));
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to delete project';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Run on mount and filter changes
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects, filters]);

  // Load managers on mount
  useEffect(() => {
    fetchManagers();
  }, [fetchManagers]);

  const updateFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  return {
    projects,
    managers,
    isLoading,
    error,
    filters,
    updateFilters,
    refetchProjects: fetchProjects,
    addProject,
    editProject,
    removeProject,
  };
};

export default useProjects;
