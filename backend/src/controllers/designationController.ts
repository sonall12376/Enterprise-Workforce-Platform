import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import Designation from '../models/Designation';
import { z } from 'zod';

const designationSchema = z.object({
  deptId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid department ID'),
  title: z.string().min(1, 'Title is required').trim(),
  grade: z.string().optional(),
});

export const createDesignation = async (req: AuthenticatedRequest, res: Response) => {
  const parsed = designationSchema.safeParse(req.body);
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
    const designation = new Designation({ ...parsed.data, orgId });
    await designation.save();
    return res.status(201).json({ status: 'success', data: designation });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', statusCode: 500, message: error.message });
  }
};

export const getDesignations = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.orgId || req.query.orgId || '603d2e1b12cf000000000001';
  try {
    const query: any = { orgId };
    if (req.query.deptId) {
      query.deptId = req.query.deptId;
    }
    const designations = await Designation.find(query)
      .populate({ path: 'deptId', select: 'name code' });
    return res.status(200).json({ status: 'success', data: designations });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', statusCode: 500, message: error.message });
  }
};

export const getDesignationById = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.orgId || req.query.orgId || '603d2e1b12cf000000000001';
  try {
    const { id } = req.params;
    const designation = await Designation.findOne({ _id: id, orgId })
      .populate({ path: 'deptId', select: 'name code' });
    if (!designation) {
      return res.status(404).json({ status: 'error', statusCode: 404, message: 'Designation not found' });
    }
    return res.status(200).json({ status: 'success', data: designation });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', statusCode: 500, message: error.message });
  }
};

export const updateDesignation = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const orgId = req.user?.orgId || req.body.orgId || '603d2e1b12cf000000000001';
  const parsed = designationSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failure',
      errors: parsed.error.format(),
    });
  }
  try {
    const designation = await Designation.findOneAndUpdate({ _id: id, orgId }, parsed.data, { new: true });
    if (!designation) {
      return res.status(404).json({ status: 'error', statusCode: 404, message: 'Designation not found' });
    }
    return res.status(200).json({ status: 'success', data: designation });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', statusCode: 500, message: error.message });
  }
};

export const deleteDesignation = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.orgId || '603d2e1b12cf000000000001';
  try {
    const { id } = req.params;
    const designation = await Designation.findOneAndDelete({ _id: id, orgId });
    if (!designation) {
      return res.status(404).json({ status: 'error', statusCode: 404, message: 'Designation not found' });
    }
    return res.status(200).json({ status: 'success', message: 'Designation deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', statusCode: 500, message: error.message });
  }
};
