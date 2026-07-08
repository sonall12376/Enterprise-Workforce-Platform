import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createAssetSchema = z.object({
  name: z.string().min(2, 'Asset name must be at least 2 characters').trim(),
  serialNumber: z.string().min(2, 'Serial number must be at least 2 characters').trim(),
  type: z.enum(['Hardware', 'Software', 'Furniture']),
  status: z.enum(['Available', 'Assigned', 'Maintenance', 'Retired']).optional().default('Available'),
});

export const updateAssetSchema = z.object({
  name: z.string().min(2, 'Asset name must be at least 2 characters').trim().optional(),
  serialNumber: z.string().min(2, 'Serial number must be at least 2 characters').trim().optional(),
  type: z.enum(['Hardware', 'Software', 'Furniture']).optional(),
  status: z.enum(['Available', 'Assigned', 'Maintenance', 'Retired']).optional(),
});

export const assignAssetSchema = z.object({
  assetId: z.string().regex(objectIdRegex, 'Invalid asset ID format'),
  employeeId: z.string().regex(objectIdRegex, 'Invalid employee ID format'),
});
