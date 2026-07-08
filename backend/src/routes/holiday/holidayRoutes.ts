import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import {
  createHoliday,
  getHolidays,
  getHolidayById,
  updateHoliday,
  deleteHoliday,
} from '../../controllers/holidayController';
import asyncHandler from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.post('/', authorize(['SuperAdmin', 'OrgAdmin']), asyncHandler(createHoliday));
router.get('/', authorize(['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee']), asyncHandler(getHolidays));
router.get('/:id', authorize(['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee']), asyncHandler(getHolidayById));
router.put('/:id', authorize(['SuperAdmin', 'OrgAdmin']), asyncHandler(updateHoliday));
router.delete('/:id', authorize(['SuperAdmin', 'OrgAdmin']), asyncHandler(deleteHoliday));

export default router;
