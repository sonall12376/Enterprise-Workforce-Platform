import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import recruitmentService from '../services/recruitmentService';
import {
  createCandidateSchema,
  updateCandidateSchema,
  scheduleInterviewSchema,
  submitFeedbackSchema,
  generateOfferSchema,
} from '../validators/recruitmentValidator';
import mongoose from 'mongoose';

export const createCandidate = async (req: AuthenticatedRequest, res: Response) => {
  const result = createCandidateSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      errors: result.error.format(),
    });
  }

  const orgId = (req.user?.orgId || req.body.orgId || '603d2e1b12cf000000000001') as string;

  try {
    const candidate = await recruitmentService.createCandidate(result.data, orgId);
    return res.status(201).json({
      status: 'success',
      message: 'Candidate created successfully',
      data: candidate,
    });
  } catch (error: any) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: error.message || 'Failed to add candidate',
    });
  }
};

export const getCandidates = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = (req.user?.orgId || req.query.orgId || '603d2e1b12cf000000000001') as string;
  const search = req.query.search as string;
  const status = req.query.status as string;

  try {
    const candidates = await recruitmentService.getAllCandidates(orgId, search, status);
    return res.status(200).json({
      status: 'success',
      data: candidates,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'Failed to fetch candidates',
    });
  }
};

export const getCandidateById = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const orgId = (req.user?.orgId || req.query.orgId || '603d2e1b12cf000000000001') as string;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid candidate ID format',
    });
  }

  try {
    const candidate = await recruitmentService.getCandidateById(id, orgId);
    if (!candidate) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Candidate not found',
      });
    }
    return res.status(200).json({
      status: 'success',
      data: candidate,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'Failed to fetch candidate',
    });
  }
};

export const updateCandidate = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const orgId = (req.user?.orgId || req.body.orgId || '603d2e1b12cf000000000001') as string;
  const performer = req.user?.id || 'System';

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid candidate ID format',
    });
  }

  const result = updateCandidateSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      errors: result.error.format(),
    });
  }

  try {
    const updated = await recruitmentService.updateCandidate(id, result.data, orgId, performer);
    if (!updated) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Candidate not found or unauthorized',
      });
    }
    return res.status(200).json({
      status: 'success',
      message: 'Candidate updated successfully',
      data: updated,
    });
  } catch (error: any) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: error.message || 'Failed to update candidate',
    });
  }
};

export const deleteCandidate = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const orgId = (req.user?.orgId || '603d2e1b12cf000000000001') as string;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid candidate ID format',
    });
  }

  try {
    const deleted = await recruitmentService.deleteCandidate(id, orgId);
    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Candidate not found or unauthorized',
      });
    }
    return res.status(200).json({
      status: 'success',
      message: 'Candidate deleted successfully',
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'Failed to delete candidate',
    });
  }
};

// Interviews
export const scheduleInterview = async (req: AuthenticatedRequest, res: Response) => {
  const result = scheduleInterviewSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      errors: result.error.format(),
    });
  }

  const orgId = (req.user?.orgId || '603d2e1b12cf000000000001') as string;
  const performer = req.user?.id || 'System';

  try {
    const interview = await recruitmentService.scheduleInterview(result.data, orgId, performer);
    return res.status(201).json({
      status: 'success',
      message: 'Interview scheduled successfully',
      data: interview,
    });
  } catch (error: any) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: error.message || 'Failed to schedule interview',
    });
  }
};

export const getInterviews = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = (req.user?.orgId || '603d2e1b12cf000000000001') as string;
  const candidateId = req.query.candidateId as string;

  try {
    const interviews = await recruitmentService.getInterviews(orgId, candidateId);
    return res.status(200).json({
      status: 'success',
      data: interviews,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'Failed to fetch interviews',
    });
  }
};

export const submitInterviewFeedback = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params; // interviewId
  const orgId = (req.user?.orgId || '603d2e1b12cf000000000001') as string;
  const performer = req.user?.id || 'System';

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid interview ID format',
    });
  }

  const result = submitFeedbackSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      errors: result.error.format(),
    });
  }

  try {
    const feedback = await recruitmentService.submitFeedback(id, result.data, orgId, performer);
    return res.status(200).json({
      status: 'success',
      message: 'Feedback submitted successfully',
      data: feedback,
    });
  } catch (error: any) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: error.message || 'Failed to submit feedback',
    });
  }
};

export const getInterviewFeedback = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params; // interviewId

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid interview ID format',
    });
  }

  try {
    const feedbackList = await recruitmentService.getInterviewFeedbackList(id);
    return res.status(200).json({
      status: 'success',
      data: feedbackList,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'Failed to fetch feedback list',
    });
  }
};

// Offers
export const generateOffer = async (req: AuthenticatedRequest, res: Response) => {
  const { candidateId } = req.body;
  const orgId = (req.user?.orgId || '603d2e1b12cf000000000001') as string;
  const performer = req.user?.id || 'System';

  if (!candidateId || !mongoose.Types.ObjectId.isValid(candidateId)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid or missing candidate ID',
    });
  }

  const result = generateOfferSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      errors: result.error.format(),
    });
  }

  try {
    const offer = await recruitmentService.generateOffer(candidateId, result.data, orgId, performer);
    return res.status(201).json({
      status: 'success',
      message: 'Offer letter generated successfully',
      data: offer,
    });
  } catch (error: any) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: error.message || 'Failed to generate offer letter',
    });
  }
};

// Convert to Employee
export const convertCandidateToEmployee = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params; // candidateId
  const orgId = (req.user?.orgId || '603d2e1b12cf000000000001') as string;
  const performer = req.user?.id || 'System';

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid candidate ID format',
    });
  }

  try {
    const employee = await recruitmentService.convertToEmployee(id, req.body, orgId, performer);
    return res.status(201).json({
      status: 'success',
      message: 'Candidate converted to Employee successfully',
      data: employee,
    });
  } catch (error: any) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: error.message || 'Failed to convert candidate',
    });
  }
};
