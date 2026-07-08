import { Router } from 'express';
import {
  createGoal,
  getGoals,
  updateGoal,
  createReview,
  getReviews,
  acknowledgeReview,
} from '../../controllers/performance/performanceController';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Apply auth middleware to all performance endpoints
router.use(authenticate as any);

router.post('/goals', createGoal as any);
router.get('/goals', getGoals as any);
router.patch('/goals/:id', updateGoal as any);
router.post('/reviews', createReview as any);
router.get('/reviews', getReviews as any);
router.patch('/reviews/:id/acknowledge', acknowledgeReview as any);

export default router;
