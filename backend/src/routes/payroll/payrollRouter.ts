import { Router } from 'express';
import {
  setupSalary,
  calculatePayroll,
  getPayslips,
  processPayroll,
} from '../../controllers/payroll/payrollController';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Apply auth middleware to all payroll endpoints
router.use(authenticate as any);

router.post('/salary-setup', setupSalary as any);
router.post('/calculate', calculatePayroll as any);
router.get('/payslips', getPayslips as any);
router.patch('/approve/:id', processPayroll as any);

export default router;
