import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createProjectSchema = z.object({
  name: z.string()
    .min(2, 'Project name must be at least 2 characters')
    .max(100, 'Project name cannot exceed 100 characters')
    .trim(),
  code: z.string()
    .min(2, 'Project code must be at least 2 characters')
    .max(20, 'Project code cannot exceed 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Project code must contain only alphanumeric characters, dashes, or underscores')
    .trim()
    .toUpperCase(),
  startDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
  managerId: z.string().regex(objectIdRegex, 'Invalid manager ID format'),
  status: z.enum(['Planning', 'Active', 'Completed', 'OnHold']).optional(),
}).refine((data) => {
  if (data.endDate && data.startDate > data.endDate) {
    return false;
  }
  return true;
}, {
  message: 'End date must be on or after start date',
  path: ['endDate'],
});

export const updateProjectSchema = z.object({
  name: z.string()
    .min(2, 'Project name must be at least 2 characters')
    .max(100, 'Project name cannot exceed 100 characters')
    .trim()
    .optional(),
  code: z.string()
    .min(2, 'Project code must be at least 2 characters')
    .max(20, 'Project code cannot exceed 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Project code must contain only alphanumeric characters, dashes, or underscores')
    .trim()
    .toUpperCase()
    .optional(),
  startDate: z.string().transform((val) => new Date(val)).optional(),
  endDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)).optional(),
  managerId: z.string().regex(objectIdRegex, 'Invalid manager ID format').optional(),
  status: z.enum(['Planning', 'Active', 'Completed', 'OnHold']).optional(),
}).refine((data) => {
  if (data.startDate && data.endDate && data.startDate > data.endDate) {
    return false;
  }
  return true;
}, {
  message: 'End date must be on or after start date',
  path: ['endDate'],
});
