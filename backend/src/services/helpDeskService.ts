import HelpDeskTicket, { IHelpDeskTicket } from '../models/HelpDeskTicket';
import Employee from '../models/Employee';
import mongoose from 'mongoose';

export const helpDeskService = {
  createTicket: async (orgId: string, raisedById: string, data: any): Promise<IHelpDeskTicket> => {
    const { subject, description, category, priority } = data;

    const ticket = new HelpDeskTicket({
      orgId,
      raisedById,
      subject: subject.trim(),
      description: description.trim(),
      category,
      priority,
      status: 'Open',
    });

    return await (await ticket.save()).populate([{ path: 'raisedById', select: 'name email employeeId role' }]);
  },

  getTickets: async (orgId: string, filters: any, callerId: string, callerRole: string): Promise<any[]> => {
    let query: any = { orgId };

    // Enforce role visibility
    if (callerRole === 'Employee') {
      query.raisedById = callerId;
    } else {
      // Admins/Managers can filter
      if (filters.status) query.status = filters.status;
      if (filters.category) query.category = filters.category;
      if (filters.priority) query.priority = filters.priority;
      if (filters.raisedById) query.raisedById = filters.raisedById;
      if (filters.assignedToId) query.assignedToId = filters.assignedToId;
    }

    return await HelpDeskTicket.find(query)
      .sort({ createdAt: -1 })
      .populate({ path: 'raisedById', select: 'name email employeeId role' })
      .populate({ path: 'assignedToId', select: 'name email employeeId role' })
      .lean();
  },

  getTicketById: async (orgId: string, id: string, callerId: string, callerRole: string): Promise<any> => {
    const ticket = await HelpDeskTicket.findOne({ _id: id, orgId })
      .populate({ path: 'raisedById', select: 'name email employeeId role' })
      .populate({ path: 'assignedToId', select: 'name email employeeId role' })
      .lean();

    if (!ticket) return null;

    // Visibility check
    if (
      callerRole === 'Employee' &&
      ticket.raisedById._id.toString() !== callerId &&
      ticket.assignedToId?._id?.toString() !== callerId
    ) {
      throw new Error('Unauthorized access to ticket details');
    }

    return ticket;
  },

  updateTicket: async (
    orgId: string,
    id: string,
    data: any,
    callerId: string,
    callerRole: string
  ): Promise<IHelpDeskTicket | null> => {
    const ticket = await HelpDeskTicket.findOne({ _id: id, orgId });
    if (!ticket) return null;

    // Access check
    if (callerRole === 'Employee' && ticket.raisedById.toString() !== callerId) {
      throw new Error('Unauthorized to update this ticket');
    }

    // Employees can only edit Open tickets
    if (callerRole === 'Employee' && ticket.status !== 'Open') {
      throw new Error('Employees can only modify tickets in Open state');
    }

    const { subject, description, category, priority } = data;
    if (subject !== undefined) ticket.subject = subject.trim();
    if (description !== undefined) ticket.description = description.trim();
    if (category !== undefined) ticket.category = category;
    if (priority !== undefined) ticket.priority = priority;

    return await (
      await ticket.save()
    ).populate([
      { path: 'raisedById', select: 'name email employeeId role' },
      { path: 'assignedToId', select: 'name email employeeId role' },
    ]);
  },

  assignTicket: async (orgId: string, id: string, assignedToId: string): Promise<IHelpDeskTicket | null> => {
    const ticket = await HelpDeskTicket.findOne({ _id: id, orgId });
    if (!ticket) return null;

    const employee = await Employee.findOne({ _id: assignedToId, orgId });
    if (!employee) {
      throw new Error('Assigned employee not found in this organization');
    }

    ticket.assignedToId = new mongoose.Types.ObjectId(assignedToId);

    // Automatically transition to Assigned if it is currently Open
    if (ticket.status === 'Open') {
      ticket.status = 'Assigned';
    }

    return await (
      await ticket.save()
    ).populate([
      { path: 'raisedById', select: 'name email employeeId role' },
      { path: 'assignedToId', select: 'name email employeeId role' },
    ]);
  },

  updateTicketStatus: async (
    orgId: string,
    id: string,
    status: 'Open' | 'Assigned' | 'InProgress' | 'Resolved' | 'Closed',
    callerId: string,
    callerRole: string
  ): Promise<IHelpDeskTicket | null> => {
    const ticket = await HelpDeskTicket.findOne({ _id: id, orgId });
    if (!ticket) return null;

    // Authorization checks
    const isRaiser = ticket.raisedById.toString() === callerId;
    const isAssignee = ticket.assignedToId?.toString() === callerId;
    const isAdminOrManager = ['SuperAdmin', 'OrgAdmin', 'Manager'].includes(callerRole);

    if (!isRaiser && !isAssignee && !isAdminOrManager) {
      throw new Error('Unauthorized to update ticket status');
    }

    // Employees can only close their own raised tickets
    if (callerRole === 'Employee' && !isAdminOrManager) {
      if (status !== 'Closed') {
        throw new Error('Employees can only transition tickets to Closed');
      }
    }

    // Workflow state validation checks
    const currentStatus = ticket.status;
    if (currentStatus === status) {
      return ticket;
    }

    // Closed tickets cannot be changed (except by Admins/Managers reopening them)
    if (currentStatus === 'Closed' && !isAdminOrManager) {
      throw new Error('Closed tickets cannot be changed');
    }

    const validTransitions: { [key: string]: string[] } = {
      Open: ['Assigned', 'Closed'],
      Assigned: ['InProgress', 'Closed'],
      InProgress: ['Resolved', 'Closed'],
      Resolved: ['Closed'],
      Closed: ['Assigned', 'InProgress'], // Admins can reopen
    };

    const allowed = validTransitions[currentStatus] || [];
    if (!allowed.includes(status) && !isAdminOrManager) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${status}`);
    }

    ticket.status = status;

    return await (
      await ticket.save()
    ).populate([
      { path: 'raisedById', select: 'name email employeeId role' },
      { path: 'assignedToId', select: 'name email employeeId role' },
    ]);
  },

  deleteTicket: async (orgId: string, id: string): Promise<IHelpDeskTicket | null> => {
    return await HelpDeskTicket.findOneAndDelete({ _id: id, orgId });
  },
};

export default helpDeskService;
