export interface TicketUser {
  _id: string;
  name: string;
  email: string;
  employeeId: string;
  role: string;
}

export interface HelpDeskTicket {
  _id: string;
  orgId: string;
  raisedById: TicketUser;
  assignedToId?: TicketUser | null;
  subject: string;
  description: string;
  category: 'IT' | 'HR' | 'Facilities' | 'Finance';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'Assigned' | 'InProgress' | 'Resolved' | 'Closed';
  createdAt: string;
  updatedAt: string;
}

export interface TicketCreateInput {
  subject: string;
  description: string;
  category: 'IT' | 'HR' | 'Facilities' | 'Finance';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
}

export interface TicketUpdateInput {
  subject?: string;
  description?: string;
  category?: 'IT' | 'HR' | 'Facilities' | 'Finance';
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
}
