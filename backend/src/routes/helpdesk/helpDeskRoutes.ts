import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  assignTicket,
  updateTicketStatus,
} from '../../controllers/helpDeskController';
import asyncHandler from '../../utils/asyncHandler';

const router = Router();

// Enforce auth on all helpdesk routes
router.use(authenticate);

// Ticket CRUD and actions
router.post('/tickets', asyncHandler(createTicket));
router.get('/tickets', asyncHandler(getTickets));
router.get('/tickets/:id', asyncHandler(getTicketById));
router.put('/tickets/:id', asyncHandler(updateTicket));
router.delete('/tickets/:id', authorize(['SuperAdmin', 'OrgAdmin']), asyncHandler(deleteTicket));

router.post('/tickets/:id/assign', authorize(['SuperAdmin', 'OrgAdmin', 'Manager']), asyncHandler(assignTicket));
router.patch('/tickets/:id/status', asyncHandler(updateTicketStatus));

export default router;
