import { z } from 'zod';

export const clockInSchema = z.object({
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }).optional(), // coordinates are optional in case geofence check is bypassed in configuration
});

export const correctionRequestSchema = z.object({
  attendanceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid attendance ID format'),
  requestedClockIn: z.string().datetime({ message: 'Invalid ISO date-time string for requestedClockIn' }),
  requestedClockOut: z.string().datetime({ message: 'Invalid ISO date-time string for requestedClockOut' }),
  reason: z.string().min(5, 'Reason must be at least 5 characters long').max(500, 'Reason is too long'),
}).refine(
  (data) => new Date(data.requestedClockOut) > new Date(data.requestedClockIn),
  {
    message: 'Requested clock-out time must be after the requested clock-in time',
    path: ['requestedClockOut'],
  }
);

export const processCorrectionSchema = z.object({
  status: z.enum(['Approved', 'Rejected'], {
    errorMap: () => ({ message: "Status must be either 'Approved' or 'Rejected'" }),
  }),
});
