import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import Department from '../models/Department';
import { z } from 'zod';

const deptSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  code: z.string().min(1, 'Code is required').trim().toUpperCase(),
  managerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid employee ID').nullable().optional(),
});

export const createDepartment = async (req: AuthenticatedRequest, res: Response) => {
  const parsed = deptSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failure',
      errors: parsed.error.format(),
    });
  }
  const orgId = req.user?.orgId || req.body.orgId || '603d2e1b12cf000000000001';
  try {
    const existing = await Department.findOne({ orgId, code: parsed.data.code });
    if (existing) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Department with this code already exists',
      });
    }
    const dept = new Department({ ...parsed.data, orgId });
    await dept.save();
    return res.status(201).json({ status: 'success', data: dept });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', statusCode: 500, message: error.message });
  }
};

export const getDepartments = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.orgId || req.query.orgId || '603d2e1b12cf000000000001';
  try {
    const depts = await Department.find({ orgId }).populate({ path: 'managerId', select: 'name email employeeId' });
    return res.status(200).json({ status: 'success', data: depts });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', statusCode: 500, message: error.message });
  }
};

export const getDepartmentById = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.orgId || req.query.orgId || '603d2e1b12cf000000000001';
  try {
    const { id } = req.params;
    const dept = await Department.findOne({ _id: id, orgId }).populate({ path: 'managerId', select: 'name email employeeId' });
    if (!dept) {
      return res.status(404).json({ status: 'error', statusCode: 404, message: 'Department not found' });
    }
    return res.status(200).json({ status: 'success', data: dept });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', statusCode: 500, message: error.message });
  }
};

export const updateDepartment = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const orgId = req.user?.orgId || req.body.orgId || '603d2e1b12cf000000000001';
  const parsed = deptSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failure',
      errors: parsed.error.format(),
    });
  }
  try {
    const dept = await Department.findOneAndUpdate({ _id: id, orgId }, parsed.data, { new: true });
    if (!dept) {
      return res.status(404).json({ status: 'error', statusCode: 404, message: 'Department not found' });
    }
    return res.status(200).json({ status: 'success', data: dept });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', statusCode: 500, message: error.message });
  }
};

export const deleteDepartment = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.orgId || '603d2e1b12cf000000000001';
  try {
    const { id } = req.params;
    const dept = await Department.findOneAndDelete({ _id: id, orgId });
    if (!dept) {
      return res.status(404).json({ status: 'error', statusCode: 404, message: 'Department not found' });
    }
    return res.status(200).json({ status: 'success', message: 'Department deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', statusCode: 500, message: error.message });
  }
};
