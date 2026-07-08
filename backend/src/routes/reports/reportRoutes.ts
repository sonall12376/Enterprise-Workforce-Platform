import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import {
  getProjectStats,
  getTaskStats,
  getAssetStats,
  getTicketStats,
  getDashboardSummary,
  getEmployeeDistribution,
  getPayrollBudgetStats,
} from '../../controllers/reportController';
import asyncHandler from '../../utils/asyncHandler';

const router = Router();

// Enforce auth on all report routes
router.use(authenticate);

// Restricted to Admin & Managers
router.use(authorize(['SuperAdmin', 'OrgAdmin', 'Manager']));

router.get('/projects', asyncHandler(getProjectStats));
router.get('/tasks', asyncHandler(getTaskStats));
router.get('/assets', asyncHandler(getAssetStats));
router.get('/tickets', asyncHandler(getTicketStats));
router.get('/dashboard', asyncHandler(getDashboardSummary));
router.get('/employees', asyncHandler(getEmployeeDistribution));
router.get('/payroll', asyncHandler(getPayrollBudgetStats));

export default router;
