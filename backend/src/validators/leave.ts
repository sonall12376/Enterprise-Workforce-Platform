import { z } from 'zod';

export const leaveRequestSchema = z.object({
  leaveType: z.enum(['Casual', 'Sick', 'Earned', 'Unpaid'], {
    errorMap: () => ({ message: "Leave type must be either 'Casual', 'Sick', 'Earned', or 'Unpaid'" }),
  }),
  startDate: z.string().datetime({ message: 'Invalid ISO date-time string for startDate' }),
  endDate: z.string().datetime({ message: 'Invalid ISO date-time string for endDate' }),
  reason: z.string().min(5, 'Reason must be at least 5 characters long').max(500, 'Reason is too long'),
}).refine(
  (data) => new Date(data.endDate) >= new Date(data.startDate),
  {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  }
);

export const processLeaveSchema = z.object({
  status: z.enum(['Approved', 'Rejected'], {
    errorMap: () => ({ message: "Status must be either 'Approved' or 'Rejected'" }),
  }),
});
