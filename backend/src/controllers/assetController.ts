import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import assetService from '../services/assetService';
import { createAssetSchema, updateAssetSchema, assignAssetSchema } from '../validators/assetValidator';
import mongoose from 'mongoose';

export const createAsset = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = (req.user?.orgId || req.body.orgId || '603d2e1b12cf000000000001') as string;

  const result = createAssetSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      errors: result.error.format(),
    });
  }

  try {
    const asset = await assetService.createAsset(orgId, result.data);
    return res.status(201).json({
      status: 'success',
      message: 'Asset created successfully',
      data: asset,
    });
  } catch (error: any) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: error.message || 'Failed to create asset',
    });
  }
};

export const getAssets = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = (req.user?.orgId || req.query.orgId || '603d2e1b12cf000000000001') as string;
  const callerId = (req.user?.id || '603d2e1b12cf000000000005') as string;
  const callerRole = (req.user?.role || 'OrgAdmin') as string;

  const filters = {
    status: req.query.status as string,
    type: req.query.type as string,
    name: req.query.name as string,
    serialNumber: req.query.serialNumber as string,
  };

  try {
    const assets = await assetService.getAssets(orgId, filters, callerId, callerRole);
    return res.status(200).json({
      status: 'success',
      data: assets,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'Failed to fetch assets',
    });
  }
};

export const getAssetById = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = (req.user?.orgId || req.query.orgId || '603d2e1b12cf000000000001') as string;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid asset ID format',
    });
  }

  try {
    const asset = await assetService.getAssetById(orgId, id);
    if (!asset) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Asset not found',
      });
    }
    return res.status(200).json({
      status: 'success',
      data: asset,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'Failed to fetch asset details',
    });
  }
};

export const updateAsset = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = (req.user?.orgId || req.body.orgId || '603d2e1b12cf000000000001') as string;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid asset ID format',
    });
  }

  const result = updateAssetSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      errors: result.error.format(),
    });
  }

  try {
    const asset = await assetService.updateAsset(orgId, id, result.data);
    if (!asset) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Asset not found or unauthorized',
      });
    }
    return res.status(200).json({
      status: 'success',
      message: 'Asset updated successfully',
      data: asset,
    });
  } catch (error: any) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: error.message || 'Failed to update asset',
    });
  }
};

export const deleteAsset = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = (req.user?.orgId || req.query.orgId || '603d2e1b12cf000000000001') as string;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid asset ID format',
    });
  }

  try {
    const deletedAsset = await assetService.deleteAsset(orgId, id);
    if (!deletedAsset) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Asset not found or unauthorized',
      });
    }
    return res.status(200).json({
      status: 'success',
      message: 'Asset deleted successfully',
    });
  } catch (error: any) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: error.message || 'Failed to delete asset',
    });
  }
};

export const assignAsset = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = (req.user?.orgId || req.body.orgId || '603d2e1b12cf000000000001') as string;
  const allocatedById = (req.user?.id || '603d2e1b12cf000000000005') as string;

  const result = assignAssetSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      errors: result.error.format(),
    });
  }

  try {
    const { assetId, employeeId } = req.body;
    await assetService.assignAsset(orgId, assetId, employeeId, allocatedById);
    return res.status(200).json({
      status: 'success',
      message: 'Asset allocated successfully',
    });
  } catch (error: any) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: error.message || 'Failed to assign asset',
    });
  }
};

export const returnAsset = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = (req.user?.orgId || req.body.orgId || '603d2e1b12cf000000000001') as string;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid asset ID format',
    });
  }

  try {
    await assetService.returnAsset(orgId, id);
    return res.status(200).json({
      status: 'success',
      message: 'Asset returned successfully',
    });
  } catch (error: any) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: error.message || 'Failed to return asset',
    });
  }
};
