import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import helpDeskService from '../services/helpDeskService';
import { createTicketSchema, updateTicketSchema, assignTicketSchema, updateTicketStatusSchema } from '../validators/helpDeskValidator';
import mongoose from 'mongoose';

export const createTicket = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = (req.user?.orgId || '603d2e1b12cf000000000001') as string;
  const raisedById = (req.user?.id || '603d2e1b12cf000000000005') as string;

  const result = createTicketSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      errors: result.error.format(),
    });
  }

  try {
    const ticket = await helpDeskService.createTicket(orgId, raisedById, result.data);
    return res.status(201).json({
      status: 'success',
      message: 'Ticket created successfully',
      data: ticket,
    });
  } catch (error: any) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: error.message || 'Failed to create ticket',
    });
  }
};

export const getTickets = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = (req.user?.orgId || '603d2e1b12cf000000000001') as string;
  const callerId = (req.user?.id || '603d2e1b12cf000000000005') as string;
  const callerRole = (req.user?.role || 'OrgAdmin') as string;

  const filters = {
    status: req.query.status as string,
    category: req.query.category as string,
    priority: req.query.priority as string,
    raisedById: req.query.raisedById as string,
    assignedToId: req.query.assignedToId as string,
  };

  try {
    const tickets = await helpDeskService.getTickets(orgId, filters, callerId, callerRole);
    return res.status(200).json({
      status: 'success',
      data: tickets,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'Failed to fetch tickets',
    });
  }
};

export const getTicketById = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = (req.user?.orgId || '603d2e1b12cf000000000001') as string;
  const callerId = (req.user?.id || '603d2e1b12cf000000000005') as string;
  const callerRole = (req.user?.role || 'OrgAdmin') as string;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid ticket ID format',
    });
  }

  try {
    const ticket = await helpDeskService.getTicketById(orgId, id, callerId, callerRole);
    if (!ticket) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Ticket not found',
      });
    }
    return res.status(200).json({
      status: 'success',
      data: ticket,
    });
  } catch (error: any) {
    return res.status(403).json({
      status: 'error',
      statusCode: 403,
      message: error.message || 'Unauthorized read access',
    });
  }
};

export const updateTicket = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = (req.user?.orgId || '603d2e1b12cf000000000001') as string;
  const callerId = (req.user?.id || '603d2e1b12cf000000000005') as string;
  const callerRole = (req.user?.role || 'OrgAdmin') as string;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid ticket ID format',
    });
  }

  const result = updateTicketSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      errors: result.error.format(),
    });
  }

  try {
    const ticket = await helpDeskService.updateTicket(orgId, id, result.data, callerId, callerRole);
    if (!ticket) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Ticket not found',
      });
    }
    return res.status(200).json({
      status: 'success',
      message: 'Ticket updated successfully',
      data: ticket,
    });
  } catch (error: any) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: error.message || 'Failed to update ticket',
    });
  }
};

export const assignTicket = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = (req.user?.orgId || '603d2e1b12cf000000000001') as string;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid ticket ID format',
    });
  }

  const result = assignTicketSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      errors: result.error.format(),
    });
  }

  try {
    const ticket = await helpDeskService.assignTicket(orgId, id, result.data.assignedToId);
    if (!ticket) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Ticket not found',
      });
    }
    return res.status(200).json({
      status: 'success',
      message: 'Ticket assigned successfully',
      data: ticket,
    });
  } catch (error: any) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: error.message || 'Failed to assign ticket',
    });
  }
};

export const updateTicketStatus = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = (req.user?.orgId || '603d2e1b12cf000000000001') as string;
  const callerId = (req.user?.id || '603d2e1b12cf000000000005') as string;
  const callerRole = (req.user?.role || 'OrgAdmin') as string;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid ticket ID format',
    });
  }

  const result = updateTicketStatusSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      errors: result.error.format(),
    });
  }

  try {
    const ticket = await helpDeskService.updateTicketStatus(orgId, id, result.data.status, callerId, callerRole);
    if (!ticket) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Ticket not found',
      });
    }
    return res.status(200).json({
      status: 'success',
      message: 'Ticket status updated successfully',
      data: ticket,
    });
  } catch (error: any) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: error.message || 'Failed to update ticket status',
    });
  }
};

export const deleteTicket = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = (req.user?.orgId || '603d2e1b12cf000000000001') as string;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid ticket ID format',
    });
  }

  try {
    const ticket = await helpDeskService.deleteTicket(orgId, id);
    if (!ticket) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Ticket not found or unauthorized',
      });
    }
    return res.status(200).json({
      status: 'success',
      message: 'Ticket deleted successfully',
    });
  } catch (error: any) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: error.message || 'Failed to delete ticket',
    });
  }
};
