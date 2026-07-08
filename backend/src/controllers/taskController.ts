import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import taskService from '../services/taskService';
import { createTaskSchema, updateTaskSchema, updateTaskStatusSchema } from '../validators/taskValidator';
import mongoose from 'mongoose';

export const createTask = async (req: AuthenticatedRequest, res: Response) => {
  const { projectId } = req.params;
  const orgId = (req.user?.orgId || req.body.orgId || '603d2e1b12cf000000000001') as string;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid project ID format',
    });
  }

  const result = createTaskSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      errors: result.error.format(),
    });
  }

  try {
    const task = await taskService.create(projectId, result.data, orgId);
    return res.status(201).json({
      status: 'success',
      message: 'Task created successfully',
      data: task,
    });
  } catch (error: any) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: error.message || 'Failed to create task',
    });
  }
};

export const getProjectTasks = async (req: AuthenticatedRequest, res: Response) => {
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid project ID format',
    });
  }

  const filters = {
    status: req.query.status as string,
    priority: req.query.priority as string,
    assignedToId: req.query.assignedToId as string,
  };

  try {
    const tasks = await taskService.getAll(projectId, filters);
    return res.status(200).json({
      status: 'success',
      data: tasks,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'Failed to fetch tasks',
    });
  }
};

export const getTaskById = async (req: AuthenticatedRequest, res: Response) => {
  const { projectId, id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid project or task ID format',
    });
  }

  try {
    const task = await taskService.getById(projectId, id);
    if (!task) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Task not found under this project',
      });
    }
    return res.status(200).json({
      status: 'success',
      data: task,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'Failed to fetch task',
    });
  }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
  const { projectId, id } = req.params;
  const orgId = (req.user?.orgId || req.body.orgId || '603d2e1b12cf000000000001') as string;

  if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid project or task ID format',
    });
  }

  const result = updateTaskSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      errors: result.error.format(),
    });
  }

  try {
    const updatedTask = await taskService.update(projectId, id, result.data, orgId);
    if (!updatedTask) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Task not found or unauthorized',
      });
    }
    return res.status(200).json({
      status: 'success',
      message: 'Task updated successfully',
      data: updatedTask,
    });
  } catch (error: any) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: error.message || 'Failed to update task',
    });
  }
};

export const updateTaskStatus = async (req: AuthenticatedRequest, res: Response) => {
  const { projectId, id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid project or task ID format',
    });
  }

  const result = updateTaskStatusSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      errors: result.error.format(),
    });
  }

  try {
    const updatedTask = await taskService.updateStatus(projectId, id, result.data.status);
    if (!updatedTask) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Task not found or unauthorized',
      });
    }
    return res.status(200).json({
      status: 'success',
      message: 'Task status updated successfully',
      data: updatedTask,
    });
  } catch (error: any) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: error.message || 'Failed to update task status',
    });
  }
};

export const deleteTask = async (req: AuthenticatedRequest, res: Response) => {
  const { projectId, id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid project or task ID format',
    });
  }

  try {
    const deletedTask = await taskService.delete(projectId, id);
    if (!deletedTask) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Task not found or unauthorized',
      });
    }
    return res.status(200).json({
      status: 'success',
      message: 'Task deleted successfully',
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'Failed to delete task',
    });
  }
};

export const getProjectMembers = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = (req.user?.orgId || req.query.orgId || '603d2e1b12cf000000000001') as string;

  try {
    const members = await taskService.getProjectMembers(orgId);
    return res.status(200).json({
      status: 'success',
      data: members,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'Failed to fetch project members',
    });
  }
};

export const getKanbanBoard = async (req: AuthenticatedRequest, res: Response) => {
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid project ID format',
    });
  }

  try {
    const board = await taskService.getKanbanBoard(projectId);
    return res.status(200).json({
      status: 'success',
      data: board,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'Failed to fetch Kanban board details',
    });
  }
};
