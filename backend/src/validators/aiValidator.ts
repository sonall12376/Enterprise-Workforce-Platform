import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const aiChatSchema = z.object({
  query: z.string().min(2, 'Query must be at least 2 characters').trim(),
});

export const resumeAnalysisSchema = z.object({
  resumeText: z.string().min(5, 'Resume text content must be at least 5 characters').trim(),
});

export const policyAssistantSchema = z.object({
  policyType: z.enum(['IT', 'HR', 'Finance']),
  query: z.string().min(2, 'Query must be at least 2 characters').trim(),
});

export const attendanceInsightsSchema = z.object({
  employeeId: z.string().regex(objectIdRegex, 'Invalid employee ID format'),
});

export const payrollExplanationSchema = z.object({
  employeeId: z.string().regex(objectIdRegex, 'Invalid employee ID format'),
  month: z.string().min(3, 'Month specification must be provided').trim(),
});

export const summarizeMeetingSchema = z.object({
  meetingText: z.string().min(5, 'Meeting text must be at least 5 characters').trim(),
});
