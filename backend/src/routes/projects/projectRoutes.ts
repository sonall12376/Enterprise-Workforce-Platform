import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getEligibleManagers,
} from '../../controllers/projectController';
import asyncHandler from '../../utils/asyncHandler';

const router = Router();

// Apply authentication to all project routes
router.use(authenticate);

// Auxiliary endpoint: list eligible managers for select dropdown
router.get('/managers', authorize(['SuperAdmin', 'OrgAdmin', 'Manager']), asyncHandler(getEligibleManagers));

// Project CRUD endpoints
router.post('/', authorize(['SuperAdmin', 'OrgAdmin', 'Manager']), asyncHandler(createProject));
router.get('/', authorize(['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee']), asyncHandler(getAllProjects));
router.get('/:id', authorize(['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee']), asyncHandler(getProjectById));
router.put('/:id', authorize(['SuperAdmin', 'OrgAdmin', 'Manager']), asyncHandler(updateProject));
router.delete('/:id', authorize(['SuperAdmin', 'OrgAdmin']), asyncHandler(deleteProject));

// Nest task routes under projects
import taskRouter from './taskRoutes';
router.use('/:projectId/tasks', taskRouter);

export default router;
