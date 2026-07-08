import api from '../../../services/api';
import { HelpDeskTicket, TicketCreateInput, TicketUpdateInput } from '../types/helpDeskTypes';

export const helpDeskService = {
  getTickets: async (filters?: {
    status?: string;
    category?: string;
    priority?: string;
    raisedById?: string;
    assignedToId?: string;
  }): Promise<HelpDeskTicket[]> => {
    const response = await api.get('/helpdesk/tickets', { params: filters });
    return response.data.data;
  },

  getTicket: async (id: string): Promise<HelpDeskTicket> => {
    const response = await api.get(`/helpdesk/tickets/${id}`);
    return response.data.data;
  },

  createTicket: async (data: TicketCreateInput): Promise<HelpDeskTicket> => {
    const response = await api.post('/helpdesk/tickets', data);
    return response.data.data;
  },

  updateTicket: async (id: string, data: TicketUpdateInput): Promise<HelpDeskTicket> => {
    const response = await api.put(`/helpdesk/tickets/${id}`, data);
    return response.data.data;
  },

  deleteTicket: async (id: string): Promise<void> => {
    await api.delete(`/helpdesk/tickets/${id}`);
  },

  assignTicket: async (id: string, assignedToId: string): Promise<HelpDeskTicket> => {
    const response = await api.post(`/helpdesk/tickets/${id}/assign`, { assignedToId });
    return response.data.data;
  },

  updateTicketStatus: async (
    id: string,
    status: 'Open' | 'Assigned' | 'InProgress' | 'Resolved' | 'Closed'
  ): Promise<HelpDeskTicket> => {
    const response = await api.patch(`/helpdesk/tickets/${id}/status`, { status });
    return response.data.data;
  },
};

export default helpDeskService;
