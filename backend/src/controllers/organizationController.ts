import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import Organization from '../models/Organization';
import { z } from 'zod';

const orgSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 chars').max(100).trim(),
  domain: z.string().trim().min(1, 'Domain is required'),
  logoUrl: z.string().optional(),
  address: z.string().optional(),
});

export const createOrganization = async (req: AuthenticatedRequest, res: Response) => {
  const parsed = orgSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failure',
      errors: parsed.error.format(),
    });
  }
  try {
    const existing = await Organization.findOne({ domain: parsed.data.domain.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Organization with this domain already exists',
      });
    }
    const org = new Organization({ ...parsed.data, domain: parsed.data.domain.toLowerCase() });
    await org.save();
    return res.status(201).json({ status: 'success', data: org });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', statusCode: 500, message: error.message });
  }
};

export const getOrganizations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const query = req.user?.role === 'SuperAdmin' ? {} : { _id: req.user?.orgId };
    const orgs = await Organization.find(query);
    return res.status(200).json({ status: 'success', data: orgs });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', statusCode: 500, message: error.message });
  }
};

export const getOrganizationById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (req.user?.role !== 'SuperAdmin' && req.user?.orgId !== id) {
      return res.status(403).json({ status: 'error', statusCode: 403, message: 'Forbidden' });
    }
    const org = await Organization.findById(id);
    if (!org) {
      return res.status(404).json({ status: 'error', statusCode: 404, message: 'Organization not found' });
    }
    return res.status(200).json({ status: 'success', data: org });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', statusCode: 500, message: error.message });
  }
};

export const updateOrganization = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  if (req.user?.role !== 'SuperAdmin' && req.user?.orgId !== id) {
    return res.status(403).json({ status: 'error', statusCode: 403, message: 'Forbidden' });
  }
  const parsed = orgSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failure',
      errors: parsed.error.format(),
    });
  }
  try {
    const org = await Organization.findByIdAndUpdate(id, parsed.data, { new: true });
    if (!org) {
      return res.status(404).json({ status: 'error', statusCode: 404, message: 'Organization not found' });
    }
    return res.status(200).json({ status: 'success', data: org });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', statusCode: 500, message: error.message });
  }
};

export const deleteOrganization = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (req.user?.role !== 'SuperAdmin') {
      return res.status(403).json({ status: 'error', statusCode: 403, message: 'Forbidden' });
    }
    const org = await Organization.findByIdAndDelete(id);
    if (!org) {
      return res.status(404).json({ status: 'error', statusCode: 404, message: 'Organization not found' });
    }
    return res.status(200).json({ status: 'success', message: 'Organization deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', statusCode: 500, message: error.message });
  }
};
