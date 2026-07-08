import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import {
  createOfficeLocation,
  getOfficeLocations,
  getOfficeLocationById,
  updateOfficeLocation,
  deleteOfficeLocation,
} from '../../controllers/officeLocationController';
import asyncHandler from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.post('/', authorize(['SuperAdmin', 'OrgAdmin']), asyncHandler(createOfficeLocation));
router.get('/', authorize(['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee']), asyncHandler(getOfficeLocations));
router.get('/:id', authorize(['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee']), asyncHandler(getOfficeLocationById));
router.put('/:id', authorize(['SuperAdmin', 'OrgAdmin']), asyncHandler(updateOfficeLocation));
router.delete('/:id', authorize(['SuperAdmin', 'OrgAdmin']), asyncHandler(deleteOfficeLocation));

export default router;
