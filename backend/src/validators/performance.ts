import { z } from 'zod';

export const goalCreateSchema = z.object({
  employeeId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid employee ID format'),
  title: z.string().min(5, 'Goal description must be at least 5 characters long').max(200, 'Goal description is too long'),
  targetDate: z.string().datetime({ message: 'Invalid ISO date-time string for targetDate' }),
});

export const goalUpdateSchema = z.object({
  progress: z.number().min(0).max(100).optional(),
  status: z.enum(['NotStarted', 'InProgress', 'Achieved', 'Deferred']).optional(),
});

export const reviewCreateSchema = z.object({
  employeeId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid employee ID format'),
  reviewPeriod: z.string().min(3, 'Review period format is required (e.g. Q1-2026)').max(30),
  rating: z.number().min(1.0, 'Rating must be at least 1.0').max(5.0, 'Rating cannot exceed 5.0'),
  feedback: z.string().min(10, 'Feedback must be at least 10 characters long').max(1000),
});
