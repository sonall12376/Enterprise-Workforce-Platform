import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import documentService from '../services/documentService';
import { uploadDocumentSchema } from '../validators/documentValidator';
import mongoose from 'mongoose';

export const uploadDocument = async (req: AuthenticatedRequest, res: Response) => {
  const result = uploadDocumentSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      errors: result.error.format(),
    });
  }

  const orgId = (req.user?.orgId || req.body.orgId || '603d2e1b12cf000000000001') as string;
  const uploaderId = (req.user?.id || req.body.uploadedById || '603d2e1b12cf000000000002') as string;

  try {
    const document = await documentService.create(result.data, orgId, uploaderId);
    return res.status(201).json({
      status: 'success',
      message: 'Document saved successfully',
      data: document,
    });
  } catch (error: any) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: error.message || 'Failed to save document metadata',
    });
  }
};

export const getEmployeeDocuments = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = (req.user?.orgId || req.query.orgId || '603d2e1b12cf000000000001') as string;
  const { employeeId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(employeeId)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid employee ID format',
    });
  }

  try {
    const documents = await documentService.getAllByEmployee(orgId, employeeId);
    return res.status(200).json({
      status: 'success',
      data: documents,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'Failed to fetch employee documents',
    });
  }
};

export const getDocumentById = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const orgId = (req.user?.orgId || req.query.orgId || '603d2e1b12cf000000000001') as string;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid document ID format',
    });
  }

  try {
    const document = await documentService.getById(id, orgId);
    if (!document) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Document not found',
      });
    }
    return res.status(200).json({
      status: 'success',
      data: document,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'Failed to fetch document details',
    });
  }
};

export const deleteDocument = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const orgId = (req.user?.orgId || '603d2e1b12cf000000000001') as string;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid document ID format',
    });
  }

  try {
    const deleted = await documentService.delete(id, orgId);
    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Document not found or unauthorized',
      });
    }
    return res.status(200).json({
      status: 'success',
      message: 'Document deleted successfully',
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'Failed to delete document',
    });
  }
};
