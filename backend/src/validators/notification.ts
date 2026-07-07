import { z } from 'zod';

export const notificationQuerySchema = z.object({
  all: z.string().optional().transform((val) => val === 'true'),
});
