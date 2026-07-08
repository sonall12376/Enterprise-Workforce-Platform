import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import {
  aiChat,
  analyzeResume,
  explainPolicy,
  getAttendanceInsights,
  explainPayroll,
  summarizeMeeting,
} from '../../controllers/aiController';
import asyncHandler from '../../utils/asyncHandler';

const router = Router();

// Enforce auth on all AI endpoints
router.use(authenticate);

router.post('/chat', asyncHandler(aiChat));
router.post('/policy-assistant', asyncHandler(explainPolicy));
router.post('/payroll-explanation', asyncHandler(explainPayroll));
router.post('/summarize-meeting', asyncHandler(summarizeMeeting));

router.post('/analyze-resume', asyncHandler(analyzeResume));
router.post('/attendance-insights', asyncHandler(getAttendanceInsights));

export default router;
