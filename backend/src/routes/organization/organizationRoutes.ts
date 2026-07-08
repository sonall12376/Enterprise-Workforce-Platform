import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
} from '../../controllers/organizationController';
import asyncHandler from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.post('/', authorize(['SuperAdmin']), asyncHandler(createOrganization));
router.get('/', authorize(['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee']), asyncHandler(getOrganizations));
router.get('/:id', authorize(['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee']), asyncHandler(getOrganizationById));
router.put('/:id', authorize(['SuperAdmin', 'OrgAdmin']), asyncHandler(updateOrganization));
router.delete('/:id', authorize(['SuperAdmin']), asyncHandler(deleteOrganization));

export default router;
