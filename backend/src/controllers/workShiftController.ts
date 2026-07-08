import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import WorkShift from '../models/WorkShift';
import { z } from 'zod';

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

const workShiftSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  startTime: z.string().regex(timeRegex, 'Start time must be in HH:MM format'),
  endTime: z.string().regex(timeRegex, 'End time must be in HH:MM format'),
  gracePeriodMins: z.number().min(0).default(15),
});

export const createWorkShift = async (req: AuthenticatedRequest, res: Response) => {
  const parsed = workShiftSchema.safeParse(req.body);
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
    const shift = new WorkShift({ ...parsed.data, orgId });
    await shift.save();
    return res.status(201).json({ status: 'success', data: shift });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', statusCode: 500, message: error.message });
  }
};

export const getWorkShifts = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.orgId || req.query.orgId || '603d2e1b12cf000000000001';
  try {
    const shifts = await WorkShift.find({ orgId });
    return res.status(200).json({ status: 'success', data: shifts });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', statusCode: 500, message: error.message });
  }
};

export const getWorkShiftById = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.orgId || req.query.orgId || '603d2e1b12cf000000000001';
  try {
    const { id } = req.params;
    const shift = await WorkShift.findOne({ _id: id, orgId });
    if (!shift) {
      return res.status(404).json({ status: 'error', statusCode: 404, message: 'Work shift not found' });
    }
    return res.status(200).json({ status: 'success', data: shift });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', statusCode: 500, message: error.message });
  }
};

export const updateWorkShift = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const orgId = req.user?.orgId || req.body.orgId || '603d2e1b12cf000000000001';
  const parsed = workShiftSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failure',
      errors: parsed.error.format(),
    });
  }
  try {
    const shift = await WorkShift.findOneAndUpdate({ _id: id, orgId }, parsed.data, { new: true });
    if (!shift) {
      return res.status(404).json({ status: 'error', statusCode: 404, message: 'Work shift not found' });
    }
    return res.status(200).json({ status: 'success', data: shift });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', statusCode: 500, message: error.message });
  }
};

export const deleteWorkShift = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.orgId || '603d2e1b12cf000000000001';
  try {
    const { id } = req.params;
    const shift = await WorkShift.findOneAndDelete({ _id: id, orgId });
    if (!shift) {
      return res.status(404).json({ status: 'error', statusCode: 404, message: 'Work shift not found' });
    }
    return res.status(200).json({ status: 'success', message: 'Work shift deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', statusCode: 500, message: error.message });
  }
};
