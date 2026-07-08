import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import Holiday from '../models/Holiday';
import { z } from 'zod';

const holidaySchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  date: z.string().transform((v) => new Date(v)),
  isOptional: z.boolean().default(false),
});

export const createHoliday = async (req: AuthenticatedRequest, res: Response) => {
  const parsed = holidaySchema.safeParse(req.body);
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
    const holidayDate = parsed.data.date;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    if (holidayDate < startOfToday) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Holiday date cannot be in the past at creation time',
      });
    }

    const existing = await Holiday.findOne({ orgId, date: holidayDate });
    if (existing) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Holiday on this date already exists for the organization',
      });
    }

    const holiday = new Holiday({ ...parsed.data, orgId });
    await holiday.save();
    return res.status(201).json({ status: 'success', data: holiday });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', statusCode: 500, message: error.message });
  }
};

export const getHolidays = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.orgId || req.query.orgId || '603d2e1b12cf000000000001';
  try {
    const holidays = await Holiday.find({ orgId }).sort({ date: 1 });
    return res.status(200).json({ status: 'success', data: holidays });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', statusCode: 500, message: error.message });
  }
};

export const getHolidayById = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.orgId || req.query.orgId || '603d2e1b12cf000000000001';
  try {
    const { id } = req.params;
    const holiday = await Holiday.findOne({ _id: id, orgId });
    if (!holiday) {
      return res.status(404).json({ status: 'error', statusCode: 404, message: 'Holiday not found' });
    }
    return res.status(200).json({ status: 'success', data: holiday });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', statusCode: 500, message: error.message });
  }
};

export const updateHoliday = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const orgId = req.user?.orgId || req.body.orgId || '603d2e1b12cf000000000001';
  const parsed = holidaySchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failure',
      errors: parsed.error.format(),
    });
  }
  try {
    const holiday = await Holiday.findOneAndUpdate({ _id: id, orgId }, parsed.data, { new: true });
    if (!holiday) {
      return res.status(404).json({ status: 'error', statusCode: 404, message: 'Holiday not found' });
    }
    return res.status(200).json({ status: 'success', data: holiday });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', statusCode: 500, message: error.message });
  }
};

export const deleteHoliday = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.orgId || '603d2e1b12cf000000000001';
  try {
    const { id } = req.params;
    const holiday = await Holiday.findOneAndDelete({ _id: id, orgId });
    if (!holiday) {
      return res.status(404).json({ status: 'error', statusCode: 404, message: 'Holiday not found' });
    }
    return res.status(200).json({ status: 'success', message: 'Holiday deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', statusCode: 500, message: error.message });
  }
};
