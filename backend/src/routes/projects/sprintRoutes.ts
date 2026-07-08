import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import {
  createSprint,
  getProjectSprints,
  getSprintById,
  updateSprint,
  completeSprint,
  deleteSprint,
} from '../../controllers/sprintController';
import asyncHandler from '../../utils/asyncHandler';

const router = Router({ mergeParams: true });

// Apply authentication to all nested sprint routes
router.use(authenticate);

// Sprint CRUD and custom business operation endpoints
router.post('/', authorize(['SuperAdmin', 'OrgAdmin', 'Manager']), asyncHandler(createSprint));
router.get('/', authorize(['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee']), asyncHandler(getProjectSprints));
router.get('/:id', authorize(['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee']), asyncHandler(getSprintById));
router.put('/:id', authorize(['SuperAdmin', 'OrgAdmin', 'Manager']), asyncHandler(updateSprint));
router.post('/:id/complete', authorize(['SuperAdmin', 'OrgAdmin', 'Manager']), asyncHandler(completeSprint));
router.delete('/:id', authorize(['SuperAdmin', 'OrgAdmin', 'Manager']), asyncHandler(deleteSprint));

export default router;
