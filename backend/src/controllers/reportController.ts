import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import reportService from '../services/reportService';

export const getProjectStats = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = (req.user?.orgId || '603d2e1b12cf000000000001') as string;
  try {
    const stats = await reportService.getProjectStats(orgId);
    return res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'Failed to fetch project stats',
    });
  }
};

export const getTaskStats = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = (req.user?.orgId || '603d2e1b12cf000000000001') as string;
  try {
    const stats = await reportService.getTaskStats(orgId);
    return res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'Failed to fetch task stats',
    });
  }
};

export const getAssetStats = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = (req.user?.orgId || '603d2e1b12cf000000000001') as string;
  try {
    const stats = await reportService.getAssetStats(orgId);
    return res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'Failed to fetch asset stats',
    });
  }
};

export const getTicketStats = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = (req.user?.orgId || '603d2e1b12cf000000000001') as string;
  try {
    const stats = await reportService.getTicketStats(orgId);
    return res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'Failed to fetch ticket stats',
    });
  }
};

export const getDashboardSummary = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = (req.user?.orgId || '603d2e1b12cf000000000001') as string;
  try {
    const summary = await reportService.getDashboardSummary(orgId);
    return res.status(200).json({
      status: 'success',
      data: summary,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'Failed to fetch dashboard summary',
    });
  }
};
