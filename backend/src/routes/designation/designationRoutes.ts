import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import {
  createDesignation,
  getDesignations,
  getDesignationById,
  updateDesignation,
  deleteDesignation,
} from '../../controllers/designationController';
import asyncHandler from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.post('/', authorize(['SuperAdmin', 'OrgAdmin']), asyncHandler(createDesignation));
router.get('/', authorize(['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee']), asyncHandler(getDesignations));
router.get('/:id', authorize(['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee']), asyncHandler(getDesignationById));
router.put('/:id', authorize(['SuperAdmin', 'OrgAdmin']), asyncHandler(updateDesignation));
router.delete('/:id', authorize(['SuperAdmin', 'OrgAdmin']), asyncHandler(deleteDesignation));

export default router;
