import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createCandidateSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').trim(),
  email: z.string().email('Invalid email address format').trim(),
  phone: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  experienceYears: z.number().nonnegative('Experience years must be positive').optional(),
  skills: z.array(z.string()).optional(),
  source: z.string().optional(),
  status: z.enum(['Applied', 'Screening', 'Technical Interview', 'HR Interview', 'Selected', 'Offer Sent', 'Joined', 'Rejected']).optional(),
});

export const updateCandidateSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').trim().optional(),
  email: z.string().email('Invalid email address format').trim().optional(),
  phone: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  experienceYears: z.number().nonnegative('Experience years must be positive').optional(),
  skills: z.array(z.string()).optional(),
  source: z.string().optional(),
  status: z.enum(['Applied', 'Screening', 'Technical Interview', 'HR Interview', 'Selected', 'Offer Sent', 'Joined', 'Rejected']).optional(),
  resume: z.string().regex(objectIdRegex, 'Invalid resume document ID').nullable().optional(),
});

export const scheduleInterviewSchema = z.object({
  candidateId: z.string().regex(objectIdRegex, 'Invalid candidate ID'),
  interviewerId: z.string().regex(objectIdRegex, 'Invalid interviewer ID'),
  roundName: z.string().min(1, 'Round name is required').trim(),
  scheduledTime: z.string().transform((val) => new Date(val)),
  durationMins: z.number().positive().default(60),
  mode: z.enum(['Online', 'In-Person']).default('Online'),
  meetingLink: z.string().optional(),
});

export const submitFeedbackSchema = z.object({
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  comments: z.string().min(1, 'Evaluation comments are required').trim(),
  recommendation: z.enum(['Hire', 'Hold', 'Reject']),
});

export const generateOfferSchema = z.object({
  offeredSalary: z.number().positive('Salary must be a positive number'),
  joiningDate: z.string().transform((val) => new Date(val)),
  approvedById: z.string().regex(objectIdRegex, 'Invalid approver ID').optional(),
});
