import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import OfficeLocation from '../models/OfficeLocation';
import { z } from 'zod';

const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

const officeLocationSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  timezone: z.string().default('Asia/Kolkata'),
  coordinates: coordinatesSchema.optional(),
  geofenceRadius: z.number().min(1).default(100),
});

export const createOfficeLocation = async (req: AuthenticatedRequest, res: Response) => {
  const parsed = officeLocationSchema.safeParse(req.body);
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
    const loc = new OfficeLocation({ ...parsed.data, orgId });
    await loc.save();
    return res.status(201).json({ status: 'success', data: loc });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', statusCode: 500, message: error.message });
  }
};

export const getOfficeLocations = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.orgId || req.query.orgId || '603d2e1b12cf000000000001';
  try {
    const locs = await OfficeLocation.find({ orgId });
    return res.status(200).json({ status: 'success', data: locs });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', statusCode: 500, message: error.message });
  }
};

export const getOfficeLocationById = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.orgId || req.query.orgId || '603d2e1b12cf000000000001';
  try {
    const { id } = req.params;
    const loc = await OfficeLocation.findOne({ _id: id, orgId });
    if (!loc) {
      return res.status(404).json({ status: 'error', statusCode: 404, message: 'Office location not found' });
    }
    return res.status(200).json({ status: 'success', data: loc });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', statusCode: 500, message: error.message });
  }
};

export const updateOfficeLocation = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const orgId = req.user?.orgId || req.body.orgId || '603d2e1b12cf000000000001';
  const parsed = officeLocationSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failure',
      errors: parsed.error.format(),
    });
  }
  try {
    const loc = await OfficeLocation.findOneAndUpdate({ _id: id, orgId }, parsed.data, { new: true });
    if (!loc) {
      return res.status(404).json({ status: 'error', statusCode: 404, message: 'Office location not found' });
    }
    return res.status(200).json({ status: 'success', data: loc });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', statusCode: 500, message: error.message });
  }
};

export const deleteOfficeLocation = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.orgId || '603d2e1b12cf000000000001';
  try {
    const { id } = req.params;
    const loc = await OfficeLocation.findOneAndDelete({ _id: id, orgId });
    if (!loc) {
      return res.status(404).json({ status: 'error', statusCode: 404, message: 'Office location not found' });
    }
    return res.status(200).json({ status: 'success', message: 'Office location deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', statusCode: 500, message: error.message });
  }
};
