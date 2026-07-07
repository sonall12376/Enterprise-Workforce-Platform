import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import {
  createCandidate,
  getCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
  scheduleInterview,
  getInterviews,
  submitInterviewFeedback,
  getInterviewFeedback,
  generateOffer,
  convertCandidateToEmployee,
} from '../../controllers/recruitmentController';
import asyncHandler from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate);

// Candidates
router.post('/candidates', authorize(['SuperAdmin', 'OrgAdmin', 'Manager']), asyncHandler(createCandidate));
router.get('/candidates', authorize(['SuperAdmin', 'OrgAdmin', 'Manager']), asyncHandler(getCandidates));
router.get('/candidates/:id', authorize(['SuperAdmin', 'OrgAdmin', 'Manager']), asyncHandler(getCandidateById));
router.put('/candidates/:id', authorize(['SuperAdmin', 'OrgAdmin', 'Manager']), asyncHandler(updateCandidate));
router.delete('/candidates/:id', authorize(['SuperAdmin', 'OrgAdmin']), asyncHandler(deleteCandidate));

// Interviews
router.post('/interviews', authorize(['SuperAdmin', 'OrgAdmin', 'Manager']), asyncHandler(scheduleInterview));
router.get('/interviews', authorize(['SuperAdmin', 'OrgAdmin', 'Manager']), asyncHandler(getInterviews));
router.put('/interviews/:id/feedback', authorize(['SuperAdmin', 'OrgAdmin', 'Manager']), asyncHandler(submitInterviewFeedback));
router.get('/interviews/:id/feedback', authorize(['SuperAdmin', 'OrgAdmin', 'Manager']), asyncHandler(getInterviewFeedback));

// Offers
router.post('/offers', authorize(['SuperAdmin', 'OrgAdmin']), asyncHandler(generateOffer));

// Conversion
router.post('/candidates/:id/convert', authorize(['SuperAdmin', 'OrgAdmin']), asyncHandler(convertCandidateToEmployee));

export default router;
