import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} from '../../controllers/departmentController';
import asyncHandler from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.post('/', authorize(['SuperAdmin', 'OrgAdmin']), asyncHandler(createDepartment));
router.get('/', authorize(['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee']), asyncHandler(getDepartments));
router.get('/:id', authorize(['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee']), asyncHandler(getDepartmentById));
router.put('/:id', authorize(['SuperAdmin', 'OrgAdmin', 'Manager']), asyncHandler(updateDepartment));
router.delete('/:id', authorize(['SuperAdmin', 'OrgAdmin']), asyncHandler(deleteDepartment));

export default router;
