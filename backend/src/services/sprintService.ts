import Sprint, { ISprint } from '../models/Sprint';
import Task from '../models/Task';
import Project from '../models/Project';
import mongoose from 'mongoose';

export const sprintService = {
  create: async (projectId: string, data: any): Promise<ISprint> => {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const { name, startDate, endDate, goal, status } = data;

    // Check if there is already an Active sprint for this project
    if (status === 'Active') {
      const activeSprint = await Sprint.findOne({ projectId, status: 'Active' });
      if (activeSprint) {
        throw new Error('There is already an active sprint for this project');
      }
    }

    const sprint = new Sprint({
      projectId,
      name,
      startDate,
      endDate,
      goal,
      status: status || 'Upcoming',
    });

    return await sprint.save();
  },

  getAll: async (projectId: string): Promise<ISprint[]> => {
    return await Sprint.find({ projectId }).sort({ startDate: 1 });
  },

  getById: async (projectId: string, sprintId: string): Promise<ISprint | null> => {
    return await Sprint.findOne({ _id: sprintId, projectId });
  },

  update: async (projectId: string, sprintId: string, data: any): Promise<ISprint | null> => {
    const sprint = await Sprint.findOne({ _id: sprintId, projectId });
    if (!sprint) {
      return null;
    }

    const { name, startDate, endDate, goal, status } = data;

    // If changing status to Active, check if another active sprint exists
    if (status === 'Active' && sprint.status !== 'Active') {
      const activeSprint = await Sprint.findOne({ projectId, status: 'Active' });
      if (activeSprint) {
        throw new Error('There is already an active sprint for this project');
      }
    }

    if (name !== undefined) sprint.name = name;
    if (startDate !== undefined) sprint.startDate = startDate;
    if (endDate !== undefined) sprint.endDate = endDate;
    if (goal !== undefined) sprint.goal = goal;
    if (status !== undefined) sprint.status = status;

    return await sprint.save();
  },

  complete: async (
    projectId: string,
    sprintId: string,
    fallbackSprintId?: string
  ): Promise<{ sprint: ISprint; rolloverCount: number }> => {
    const sprint = await Sprint.findOne({ _id: sprintId, projectId });
    if (!sprint) {
      throw new Error('Sprint not found');
    }

    if (sprint.status === 'Completed') {
      throw new Error('Sprint is already completed');
    }

    // Verify fallback sprint exists if provided
    if (fallbackSprintId && fallbackSprintId !== '') {
      const fallbackSprint = await Sprint.findOne({ _id: fallbackSprintId, projectId });
      if (!fallbackSprint) {
        throw new Error('Fallback sprint not found in this project');
      }
      if (fallbackSprint.status === 'Completed') {
        throw new Error('Cannot roll over tasks to a completed sprint');
      }
    }

    // Mark sprint status completed
    sprint.status = 'Completed';
    await sprint.save();

    // Query all tasks under this sprint that are NOT done
    const unfinishedTasks = await Task.find({
      projectId,
      sprintId,
      status: { $nin: ['Done', 'Completed'] },
    });

    const rolloverCount = unfinishedTasks.length;

    if (rolloverCount > 0) {
      const targetSprintId =
        fallbackSprintId && fallbackSprintId !== '' ? new mongoose.Types.ObjectId(fallbackSprintId) : undefined;

      // Update tasks: set sprintId to targetSprintId (or clear it to move to backlog)
      await Task.updateMany(
        {
          projectId,
          sprintId,
          status: { $nin: ['Done', 'Completed'] },
        },
        {
          $set: { sprintId: targetSprintId },
        }
      );
    }

    return {
      sprint,
      rolloverCount,
    };
  },

  delete: async (projectId: string, sprintId: string): Promise<ISprint | null> => {
    const deletedSprint = await Sprint.findOneAndDelete({ _id: sprintId, projectId });
    if (deletedSprint) {
      // Unassign tasks belonging to this sprint (move them back to backlog)
      await Task.updateMany({ projectId, sprintId }, { $unset: { sprintId: 1 } });
    }
    return deletedSprint;
  },
};

export default sprintService;
