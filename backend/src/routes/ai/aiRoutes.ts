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

// Restricted to Admins & Managers
router.post('/analyze-resume', authorize(['SuperAdmin', 'OrgAdmin', 'Manager']), asyncHandler(analyzeResume));
router.post('/attendance-insights', authorize(['SuperAdmin', 'OrgAdmin', 'Manager']), asyncHandler(getAttendanceInsights));

export default router;
