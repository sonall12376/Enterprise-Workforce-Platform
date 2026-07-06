import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createTaskSchema = z.object({
  title: z.string().min(2, 'Task title must be at least 2 characters').trim(),
  description: z.string().optional().default(''),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  status: z.enum(['Todo', 'InProgress', 'Review', 'Done', 'Completed']).optional().default('Todo'),
  assignedToId: z.string().regex(objectIdRegex, 'Invalid employee ID format').optional().or(z.literal('')),
  sprintId: z.string().regex(objectIdRegex, 'Invalid sprint ID format').optional().or(z.literal('')),
  dueDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
});

export const updateTaskSchema = z.object({
  title: z.string().min(2, 'Task title must be at least 2 characters').trim().optional(),
  description: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  status: z.enum(['Todo', 'InProgress', 'Review', 'Done', 'Completed']).optional(),
  assignedToId: z.string().regex(objectIdRegex, 'Invalid employee ID format').optional().or(z.literal('')),
  sprintId: z.string().regex(objectIdRegex, 'Invalid sprint ID format').optional().or(z.literal('')),
  dueDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)).or(z.literal('')),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(['Todo', 'InProgress', 'Review', 'Done', 'Completed']),
});
