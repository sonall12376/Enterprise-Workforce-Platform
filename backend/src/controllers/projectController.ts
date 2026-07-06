import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import projectService from '../services/projectService';
import { createProjectSchema, updateProjectSchema } from '../validators/projectValidator';
import mongoose from 'mongoose';

export const createProject = async (req: AuthenticatedRequest, res: Response) => {
  const result = createProjectSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      errors: result.error.format(),
    });
  }

  const orgId = (req.user?.orgId || req.body.orgId || '603d2e1b12cf000000000001') as string;

  try {
    const project = await projectService.create(result.data, orgId);
    return res.status(201).json({
      status: 'success',
      message: 'Project created successfully',
      data: project,
    });
  } catch (error: any) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: error.message || 'Failed to create project',
    });
  }
};

export const getAllProjects = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = (req.user?.orgId || req.query.orgId || '603d2e1b12cf000000000001') as string;
  const filters = {
    status: req.query.status as string,
    managerId: req.query.managerId as string,
  };

  try {
    const projects = await projectService.getAll(orgId, filters);
    return res.status(200).json({
      status: 'success',
      data: projects,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'Failed to fetch projects',
    });
  }
};

export const getProjectById = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const orgId = (req.user?.orgId || req.query.orgId || '603d2e1b12cf000000000001') as string;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid project ID format',
    });
  }

  try {
    const project = await projectService.getById(id, orgId);
    if (!project) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Project not found',
      });
    }
    return res.status(200).json({
      status: 'success',
      data: project,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'Failed to fetch project',
    });
  }
};

export const updateProject = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const orgId = (req.user?.orgId || req.body.orgId || '603d2e1b12cf000000000001') as string;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid project ID format',
    });
  }

  const result = updateProjectSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      errors: result.error.format(),
    });
  }

  try {
    const updatedProject = await projectService.update(id, result.data, orgId);
    if (!updatedProject) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Project not found or unauthorized',
      });
    }
    return res.status(200).json({
      status: 'success',
      message: 'Project updated successfully',
      data: updatedProject,
    });
  } catch (error: any) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: error.message || 'Failed to update project',
    });
  }
};

export const deleteProject = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const orgId = (req.user?.orgId || '603d2e1b12cf000000000001') as string;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid project ID format',
    });
  }

  try {
    const deletedProject = await projectService.delete(id, orgId);
    if (!deletedProject) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Project not found or unauthorized',
      });
    }
    return res.status(200).json({
      status: 'success',
      message: 'Project deleted successfully',
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'Failed to delete project',
    });
  }
};

export const getEligibleManagers = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = (req.user?.orgId || req.query.orgId || '603d2e1b12cf000000000001') as string;

  try {
    const managers = await projectService.getEligibleManagers(orgId);
    return res.status(200).json({
      status: 'success',
      data: managers,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'Failed to fetch managers',
    });
  }
};
