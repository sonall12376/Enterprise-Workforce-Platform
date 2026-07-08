import { Router } from 'express';
import {
  submitLeave,
  getRequests,
  getBalances,
  processRequest,
} from '../../controllers/leave/leaveController';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Apply auth middleware to all leave endpoints
router.use(authenticate as any);

router.post('/request', submitLeave as any);
router.get('/requests', getRequests as any);
router.get('/balance', getBalances as any);
router.patch('/requests/:id', processRequest as any);

export default router;
