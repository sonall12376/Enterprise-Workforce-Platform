import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createTicketSchema = z.object({
  subject: z
    .string()
    .min(2, 'Subject must be at least 2 characters')
    .max(150, 'Subject must not exceed 150 characters')
    .trim(),
  description: z.string().min(5, 'Description must be at least 5 characters').trim(),
  category: z.enum(['IT', 'HR', 'Facilities', 'Finance']),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
});

export const updateTicketSchema = z.object({
  subject: z
    .string()
    .min(2, 'Subject must be at least 2 characters')
    .max(150, 'Subject must not exceed 150 characters')
    .trim()
    .optional(),
  description: z.string().min(5, 'Description must be at least 5 characters').trim().optional(),
  category: z.enum(['IT', 'HR', 'Facilities', 'Finance']).optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional(),
});

export const assignTicketSchema = z.object({
  assignedToId: z.string().regex(objectIdRegex, 'Invalid employee ID format'),
});

export const updateTicketStatusSchema = z.object({
  status: z.enum(['Open', 'Assigned', 'InProgress', 'Resolved', 'Closed']),
});
