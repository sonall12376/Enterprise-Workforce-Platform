import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createSprintSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Sprint name must be at least 2 characters')
      .max(100, 'Sprint name cannot exceed 100 characters')
      .trim(),
    startDate: z.string().transform((val) => new Date(val)),
    endDate: z.string().transform((val) => new Date(val)),
    goal: z.string().optional().default(''),
    status: z.enum(['Upcoming', 'Active', 'Completed']).optional().default('Upcoming'),
  })
  .refine(
    (data) => {
      return data.endDate >= data.startDate;
    },
    {
      message: 'End date must be on or after start date',
      path: ['endDate'],
    }
  );

export const updateSprintSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Sprint name must be at least 2 characters')
      .max(100, 'Sprint name cannot exceed 100 characters')
      .trim()
      .optional(),
    startDate: z.string().transform((val) => new Date(val)).optional(),
    endDate: z.string().transform((val) => new Date(val)).optional(),
    goal: z.string().optional(),
    status: z.enum(['Upcoming', 'Active', 'Completed']).optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate >= data.startDate;
      }
      return true;
    },
    {
      message: 'End date must be on or after start date',
      path: ['endDate'],
    }
  );

export const completeSprintSchema = z.object({
  fallbackSprintId: z
    .string()
    .regex(objectIdRegex, 'Invalid fallback sprint ID format')
    .optional()
    .or(z.literal('')),
});
