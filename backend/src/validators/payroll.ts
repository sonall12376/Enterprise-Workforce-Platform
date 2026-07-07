import { z } from 'zod';

export const salarySetupSchema = z.object({
  employeeId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid employee ID format'),
  baseSalary: z.number().min(0, 'Base salary cannot be negative'),
  allowances: z.number().min(0, 'Allowances cannot be negative').optional().default(0),
  deductions: z.number().min(0, 'Deductions cannot be negative').optional().default(0),
});

export const payrollCalculateSchema = z.object({
  employeeId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid employee ID format'),
  month: z.number().min(1, 'Month must be between 1 and 12').max(12, 'Month must be between 1 and 12'),
  year: z.number().min(2000, 'Year must be a valid calendar year'),
});

export const payrollProcessSchema = z.object({
  status: z.enum(['PendingApproval', 'Approved', 'Paid'], {
    errorMap: () => ({ message: "Status must be either 'PendingApproval', 'Approved', or 'Paid'" }),
  }),
});
