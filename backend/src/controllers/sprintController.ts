import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import sprintService from '../services/sprintService';
import { createSprintSchema, updateSprintSchema, completeSprintSchema } from '../validators/sprintValidator';
import mongoose from 'mongoose';

export const createSprint = async (req: AuthenticatedRequest, res: Response) => {
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid project ID format',
    });
  }

  const result = createSprintSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      errors: result.error.format(),
    });
  }

  try {
    const sprint = await sprintService.create(projectId, result.data);
    return res.status(201).json({
      status: 'success',
      message: 'Sprint created successfully',
      data: sprint,
    });
  } catch (error: any) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: error.message || 'Failed to create sprint',
    });
  }
};

export const getProjectSprints = async (req: AuthenticatedRequest, res: Response) => {
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid project ID format',
    });
  }

  try {
    const sprints = await sprintService.getAll(projectId);
    return res.status(200).json({
      status: 'success',
      data: sprints,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'Failed to fetch sprints',
    });
  }
};

export const getSprintById = async (req: AuthenticatedRequest, res: Response) => {
  const { projectId, id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid project or sprint ID format',
    });
  }

  try {
    const sprint = await sprintService.getById(projectId, id);
    if (!sprint) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Sprint not found under this project',
      });
    }
    return res.status(200).json({
      status: 'success',
      data: sprint,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'Failed to fetch sprint details',
    });
  }
};

export const updateSprint = async (req: AuthenticatedRequest, res: Response) => {
  const { projectId, id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid project or sprint ID format',
    });
  }

  const result = updateSprintSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      errors: result.error.format(),
    });
  }

  try {
    const sprint = await sprintService.update(projectId, id, result.data);
    if (!sprint) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Sprint not found or unauthorized',
      });
    }
    return res.status(200).json({
      status: 'success',
      message: 'Sprint updated successfully',
      data: sprint,
    });
  } catch (error: any) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: error.message || 'Failed to update sprint',
    });
  }
};

export const completeSprint = async (req: AuthenticatedRequest, res: Response) => {
  const { projectId, id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid project or sprint ID format',
    });
  }

  const result = completeSprintSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      errors: result.error.format(),
    });
  }

  try {
    const outcome = await sprintService.complete(projectId, id, result.data.fallbackSprintId);
    return res.status(200).json({
      status: 'success',
      message: 'Sprint completed successfully',
      data: outcome.sprint,
      rolloverCount: outcome.rolloverCount,
    });
  } catch (error: any) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: error.message || 'Failed to complete sprint',
    });
  }
};

export const deleteSprint = async (req: AuthenticatedRequest, res: Response) => {
  const { projectId, id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid project or sprint ID format',
    });
  }

  try {
    const deletedSprint = await sprintService.delete(projectId, id);
    if (!deletedSprint) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Sprint not found or unauthorized',
      });
    }
    return res.status(200).json({
      status: 'success',
      message: 'Sprint deleted successfully and tasks returned to backlog',
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'Failed to delete sprint',
    });
  }
};
