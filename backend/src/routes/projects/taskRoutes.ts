import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import {
  createTask,
  getProjectTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getProjectMembers,
  getKanbanBoard,
} from '../../controllers/taskController';
import asyncHandler from '../../utils/asyncHandler';

const router = Router({ mergeParams: true });

// Apply authentication to all nested task routes
router.use(authenticate);

// Auxiliary endpoint: list eligible project members to assign tasks to
router.get('/members', authorize(['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee']), asyncHandler(getProjectMembers));

// Kanban board tasks grouping endpoint
router.get('/kanban', authorize(['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee']), asyncHandler(getKanbanBoard));

// Task CRUD routes
router.post('/', authorize(['SuperAdmin', 'OrgAdmin', 'Manager']), asyncHandler(createTask));
router.get('/', authorize(['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee']), asyncHandler(getProjectTasks));
router.get('/:id', authorize(['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee']), asyncHandler(getTaskById));
router.put('/:id', authorize(['SuperAdmin', 'OrgAdmin', 'Manager']), asyncHandler(updateTask));
router.patch('/:id/status', authorize(['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee']), asyncHandler(updateTaskStatus));
router.delete('/:id', authorize(['SuperAdmin', 'OrgAdmin', 'Manager']), asyncHandler(deleteTask));

export default router;
