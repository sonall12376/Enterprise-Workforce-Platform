import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const uploadDocumentSchema = z.object({
  fileName: z.string().min(1, 'File name is required').trim(),
  fileUrl: z.string().url('Invalid URL format'),
  category: z.enum(['Policy', 'Contract', 'IDProof', 'Resume', 'Offer Letter', 'Profile Photo']),
  isPublic: z.boolean().default(false),
  uploadedById: z.string().regex(objectIdRegex, 'Invalid uploader ID').optional(),
});
