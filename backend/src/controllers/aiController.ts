import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import aiService from '../services/aiService';
import {
  aiChatSchema,
  resumeAnalysisSchema,
  policyAssistantSchema,
  attendanceInsightsSchema,
  payrollExplanationSchema,
  summarizeMeetingSchema,
} from '../validators/aiValidator';

export const aiChat = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = (req.user?.orgId || '603d2e1b12cf000000000001') as string;
  const userId = (req.user?.id || '603d2e1b12cf000000000005') as string;

  const result = aiChatSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      errors: result.error.format(),
    });
  }

  try {
    const reply = await aiService.generateChat(orgId, result.data.query, userId);
    return res.status(200).json({
      status: 'success',
      data: { reply },
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'AI request failed',
    });
  }
};

export const analyzeResume = async (req: AuthenticatedRequest, res: Response) => {
  const result = resumeAnalysisSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      errors: result.error.format(),
    });
  }

  try {
    const analysis = await aiService.analyzeResume(result.data.resumeText);
    return res.status(200).json({
      status: 'success',
      data: analysis,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'AI analysis failed',
    });
  }
};

export const explainPolicy = async (req: AuthenticatedRequest, res: Response) => {
  const result = policyAssistantSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      errors: result.error.format(),
    });
  }

  try {
    const explanation = await aiService.explainPolicy(result.data.policyType, result.data.query);
    return res.status(200).json({
      status: 'success',
      data: { explanation },
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'AI request failed',
    });
  }
};

export const getAttendanceInsights = async (req: AuthenticatedRequest, res: Response) => {
  const result = attendanceInsightsSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      errors: result.error.format(),
    });
  }

  try {
    const insights = await aiService.getAttendanceInsights(result.data.employeeId);
    return res.status(200).json({
      status: 'success',
      data: insights,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'Failed to generate attendance insights',
    });
  }
};

export const explainPayroll = async (req: AuthenticatedRequest, res: Response) => {
  const result = payrollExplanationSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      errors: result.error.format(),
    });
  }

  try {
    const explanation = await aiService.explainPayroll(result.data.employeeId, result.data.month);
    return res.status(200).json({
      status: 'success',
      data: explanation,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'Failed to explain payroll',
    });
  }
};

export const summarizeMeeting = async (req: AuthenticatedRequest, res: Response) => {
  const result = summarizeMeetingSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      errors: result.error.format(),
    });
  }

  try {
    const summary = await aiService.summarizeMeeting(result.data.meetingText);
    return res.status(200).json({
      status: 'success',
      data: summary,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'Failed to summarize meeting',
    });
  }
};
