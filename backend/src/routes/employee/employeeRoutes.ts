import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getEmployeeMetadata,
  exportEmployees,
} from '../../controllers/employeeController';
import asyncHandler from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/metadata', authorize(['SuperAdmin', 'OrgAdmin', 'Manager']), asyncHandler(getEmployeeMetadata));
router.get('/export', authorize(['SuperAdmin', 'OrgAdmin', 'Manager']), asyncHandler(exportEmployees));
router.post('/', authorize(['SuperAdmin', 'OrgAdmin']), asyncHandler(createEmployee));
router.get('/', authorize(['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee']), asyncHandler(getEmployees));
router.get('/:id', authorize(['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee']), asyncHandler(getEmployeeById));
router.put('/:id', authorize(['SuperAdmin', 'OrgAdmin', 'Manager']), asyncHandler(updateEmployee));
router.delete('/:id', authorize(['SuperAdmin', 'OrgAdmin']), asyncHandler(deleteEmployee));

export default router;
