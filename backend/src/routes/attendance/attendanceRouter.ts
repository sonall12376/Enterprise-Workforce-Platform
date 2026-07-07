import { Router } from 'express';
import {
  clockIn,
  clockOut,
  getLogs,
  submitCorrection,
  getCorrections,
  processCorrection,
} from '../../controllers/attendance/attendanceController';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Apply auth middleware to all attendance endpoints
router.use(authenticate as any);

router.post('/clock-in', clockIn as any);
router.post('/clock-out', clockOut as any);
router.get('/logs', getLogs as any);
router.post('/correction', submitCorrection as any);
router.get('/corrections', getCorrections as any);
router.patch('/corrections/:id', processCorrection as any);

export default router;
