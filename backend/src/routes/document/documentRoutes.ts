import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import {
  uploadDocument,
  getEmployeeDocuments,
  getDocumentById,
  deleteDocument,
} from '../../controllers/documentController';
import asyncHandler from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.post('/', authorize(['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee']), asyncHandler(uploadDocument));
router.get('/employee/:employeeId', authorize(['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee']), asyncHandler(getEmployeeDocuments));
router.get('/:id', authorize(['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee']), asyncHandler(getDocumentById));
router.delete('/:id', authorize(['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee']), asyncHandler(deleteDocument));

export default router;
