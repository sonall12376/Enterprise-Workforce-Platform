import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createEmployeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required').trim(),
  lastName: z.string().min(1, 'Last name is required').trim(),
  email: z.string().email('Invalid email address format').trim(),
  phone: z.string().min(5, 'Phone number must be at least 5 characters').trim(),
  gender: z.enum(['Male', 'Female', 'Other']),
  dob: z.string().transform((val) => new Date(val)),
  joiningDate: z.string().transform((val) => new Date(val)).optional(),
  deptId: z.string().regex(objectIdRegex, 'Invalid department ID').nullable().optional(),
  designationId: z.string().regex(objectIdRegex, 'Invalid designation ID').nullable().optional(),
  locationId: z.string().regex(objectIdRegex, 'Invalid office location ID').nullable().optional(),
  shiftId: z.string().regex(objectIdRegex, 'Invalid work shift ID').nullable().optional(),
  reportingManagerId: z.string().regex(objectIdRegex, 'Invalid manager ID').nullable().optional(),
  employmentType: z.enum(['Full-time', 'Part-time', 'Contract', 'Intern']).optional(),
  status: z.enum(['Active', 'Onboarding', 'Suspended', 'Terminated']).optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  emergencyContact: z.object({
    name: z.string().min(1, 'Emergency contact name is required').trim(),
    relationship: z.string().min(1, 'Relationship is required').trim(),
    phone: z.string().min(5, 'Emergency contact phone is required').trim(),
  }),
  role: z.enum(['SuperAdmin', 'OrgAdmin', 'HR', 'Manager', 'Employee']).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

export const updateEmployeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required').trim().optional(),
  lastName: z.string().min(1, 'Last name is required').trim().optional(),
  email: z.string().email('Invalid email address format').trim().optional(),
  phone: z.string().min(5, 'Phone number must be at least 5 characters').trim().optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  dob: z.string().transform((val) => new Date(val)).optional(),
  joiningDate: z.string().transform((val) => new Date(val)).optional(),
  deptId: z.string().regex(objectIdRegex, 'Invalid department ID').nullable().optional(),
  designationId: z.string().regex(objectIdRegex, 'Invalid designation ID').nullable().optional(),
  locationId: z.string().regex(objectIdRegex, 'Invalid office location ID').nullable().optional(),
  shiftId: z.string().regex(objectIdRegex, 'Invalid work shift ID').nullable().optional(),
  reportingManagerId: z.string().regex(objectIdRegex, 'Invalid manager ID').nullable().optional(),
  employmentType: z.enum(['Full-time', 'Part-time', 'Contract', 'Intern']).optional(),
  status: z.enum(['Active', 'Onboarding', 'Suspended', 'Terminated']).optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  emergencyContact: z.object({
    name: z.string().min(1, 'Emergency contact name is required').trim().optional(),
    relationship: z.string().min(1, 'Relationship is required').trim().optional(),
    phone: z.string().min(5, 'Emergency contact phone is required').trim().optional(),
  }).optional(),
  role: z.enum(['SuperAdmin', 'OrgAdmin', 'HR', 'Manager', 'Employee']).optional(),
  profilePicture: z.string().optional(),
});
