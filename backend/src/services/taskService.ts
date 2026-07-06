import Task, { ITask } from '../models/Task';
import Project from '../models/Project';
import Employee, { IEmployee } from '../models/Employee';
import mongoose from 'mongoose';

// Helper to verify project existence and check task due date limits
const validateTaskDateAndProject = async (projectId: string, dueDate?: Date) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error('Parent project not found');
  }

  if (dueDate && project.endDate && dueDate > project.endDate) {
    throw new Error(
      `Task due date cannot exceed project end date (${project.endDate.toLocaleDateString()})`
    );
  }
  return project;
};

export const taskService = {
  create: async (projectId: string, data: any, orgId: string): Promise<ITask> => {
    const { title, description, priority, status, assignedToId, dueDate } = data;

    // Validate project & due date boundary
    await validateTaskDateAndProject(projectId, dueDate);

    // Verify assignee belongs to the organization if provided
    if (assignedToId && assignedToId !== '') {
      const employee = await Employee.findOne({ _id: assignedToId, orgId });
      if (!employee) {
        throw new Error('Assigned employee not found in this organization');
      }
    }

    const task = new Task({
      projectId,
      assignedToId: assignedToId || undefined,
      title,
      description,
      priority,
      status,
      dueDate: dueDate || undefined,
    });

    return await task.save();
  },

  getAll: async (projectId: string, filters: any): Promise<ITask[]> => {
    const query: any = { projectId };
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.priority) {
      query.priority = filters.priority;
    }
    if (filters.assignedToId) {
      query.assignedToId = filters.assignedToId === 'unassigned' ? null : filters.assignedToId;
    }

    return await Task.find(query)
      .populate({
        path: 'assignedToId',
        select: 'name email role employeeId',
      })
      .sort({ createdAt: -1 });
  },

  getById: async (projectId: string, taskId: string): Promise<ITask | null> => {
    return await Task.findOne({ _id: taskId, projectId }).populate({
      path: 'assignedToId',
      select: 'name email role employeeId',
    });
  },

  update: async (projectId: string, taskId: string, data: any, orgId: string): Promise<ITask | null> => {
    const task = await Task.findOne({ _id: taskId, projectId });
    if (!task) {
      return null;
    }

    const { title, description, priority, status, assignedToId, dueDate } = data;

    // Boundary check if dueDate is being updated
    if (dueDate) {
      await validateTaskDateAndProject(projectId, dueDate);
    } else if (dueDate === '' || dueDate === null) {
      task.dueDate = undefined;
    }

    // Verify assignee if updated
    if (assignedToId && assignedToId !== '') {
      const employee = await Employee.findOne({ _id: assignedToId, orgId });
      if (!employee) {
        throw new Error('Assigned employee not found in this organization');
      }
      task.assignedToId = new mongoose.Types.ObjectId(assignedToId);
    } else if (assignedToId === '' || assignedToId === null) {
      task.assignedToId = undefined;
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;
    if (dueDate !== undefined && dueDate !== '' && dueDate !== null) task.dueDate = dueDate;

    await task.save();

    return await Task.findById(taskId).populate({
      path: 'assignedToId',
      select: 'name email role employeeId',
    });
  },

  updateStatus: async (
    projectId: string,
    taskId: string,
    status: 'Todo' | 'InProgress' | 'Review' | 'Done' | 'Completed'
  ): Promise<ITask | null> => {
    const task = await Task.findOne({ _id: taskId, projectId });
    if (!task) {
      return null;
    }

    task.status = status;
    await task.save();

    return await Task.findById(taskId).populate({
      path: 'assignedToId',
      select: 'name email role employeeId',
    });
  },

  delete: async (projectId: string, taskId: string): Promise<ITask | null> => {
    return await Task.findOneAndDelete({ _id: taskId, projectId });
  },

  getProjectMembers: async (orgId: string): Promise<IEmployee[]> => {
    // Seed default team members if empty to support dropdown selections
    const count = await Employee.countDocuments({ orgId });
    if (count <= 3) {
      const dummyTeam = [
        {
          _id: new mongoose.Types.ObjectId('603d2e1b12cf000000000020'),
          orgId,
          employeeId: 'EMP-DEV01',
          name: 'Kyle Reese',
          email: 'kyle.reese@wfm.com',
          passwordHash: 'dummyhash',
          role: 'Employee',
          status: 'Active',
        },
        {
          _id: new mongoose.Types.ObjectId('603d2e1b12cf000000000021'),
          orgId,
          employeeId: 'EMP-DEV02',
          name: 'Ellen Ripley',
          email: 'ellen.ripley@wfm.com',
          passwordHash: 'dummyhash',
          role: 'Employee',
          status: 'Active',
        },
        {
          _id: new mongoose.Types.ObjectId('603d2e1b12cf000000000022'),
          orgId,
          employeeId: 'EMP-DEV03',
          name: 'Marcus Wright',
          email: 'marcus.wright@wfm.com',
          passwordHash: 'dummyhash',
          role: 'Employee',
          status: 'Active',
        },
      ];
      // Skip insert if IDs already exist to prevent duplicate keys
      for (const m of dummyTeam) {
        const exists = await Employee.findById(m._id);
        if (!exists) {
          await Employee.create(m);
        }
      }
    }

    return await Employee.find({ orgId, status: 'Active' }).select('name email role employeeId');
  },

  getKanbanBoard: async (projectId: string): Promise<Record<string, ITask[]>> => {
    const projectExists = await Project.findById(projectId);
    if (!projectExists) {
      throw new Error('Project not found');
    }

    const tasks = await Task.find({ projectId })
      .populate({
        path: 'assignedToId',
        select: 'name email role employeeId',
      })
      .sort({ createdAt: -1 });

    const board: Record<string, ITask[]> = {
      Todo: [],
      InProgress: [],
      Review: [],
      Completed: [],
    };

    tasks.forEach((task) => {
      const statusKey = (task.status === 'Done' || task.status === 'Completed') ? 'Completed' : task.status;
      if (board[statusKey] !== undefined) {
        board[statusKey].push(task);
      } else {
        board.Todo.push(task);
      }
    });

    return board;
  },
};

export default taskService;
