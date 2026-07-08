import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../../controllers/notification/notificationController';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Apply auth middleware to all notification endpoints
router.use(authenticate as any);

router.get('/', getNotifications as any);
router.patch('/:id/read', markAsRead as any);
router.post('/read-all', markAllAsRead as any);

export default router;
