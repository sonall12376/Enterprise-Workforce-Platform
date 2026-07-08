import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import {
  createWorkShift,
  getWorkShifts,
  getWorkShiftById,
  updateWorkShift,
  deleteWorkShift,
} from '../../controllers/workShiftController';
import asyncHandler from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.post('/', authorize(['SuperAdmin', 'OrgAdmin']), asyncHandler(createWorkShift));
router.get('/', authorize(['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee']), asyncHandler(getWorkShifts));
router.get('/:id', authorize(['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee']), asyncHandler(getWorkShiftById));
router.put('/:id', authorize(['SuperAdmin', 'OrgAdmin']), asyncHandler(updateWorkShift));
router.delete('/:id', authorize(['SuperAdmin', 'OrgAdmin']), asyncHandler(deleteWorkShift));

export default router;
