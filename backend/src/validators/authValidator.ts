import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .min(1, 'Email cannot be empty')
    .email('Invalid email format'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters long'),
  role: z
    .enum(['SuperAdmin', 'OrgAdmin', 'HR', 'Manager', 'Employee'], { required_error: 'Role is required' }),
});

export const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required').trim(),
  lastName: z.string().min(1, 'Last name is required').trim(),
  email: z.string().email('Invalid email format').trim(),
  phone: z.string().min(5, 'Phone number must be at least 5 characters').trim(),
  gender: z.enum(['Male', 'Female', 'Other']),
  dob: z.string().transform((val) => new Date(val)),
  role: z.enum(['SuperAdmin', 'OrgAdmin', 'HR', 'Manager', 'Employee']).default('Employee'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters long'),
  emergencyContact: z.object({
    name: z.string().min(1, 'Emergency contact name is required').trim(),
    relationship: z.string().min(1, 'Relationship is required').trim(),
    phone: z.string().min(5, 'Emergency contact phone is required').trim(),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .min(1, 'Email cannot be empty')
    .email('Invalid email format'),
});

export const resetPasswordSchema = z.object({
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters long'),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string({ required_error: 'Current password is required' })
    .min(1, 'Current password cannot be empty'),
  newPassword: z
    .string({ required_error: 'New password is required' })
    .min(8, 'New password must be at least 8 characters long'),
});
