export interface Assignee {
  _id: string;
  name: string;
  email: string;
  role: string;
  employeeId: string;
}

export interface Sprint {
  _id: string;
  projectId: string;
  name: string;
  startDate: string;
  endDate: string;
  goal?: string;
  status: 'Upcoming' | 'Active' | 'Completed';
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  projectId: string;
  assignedToId?: Assignee;
  sprintId?: Sprint;
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Todo' | 'InProgress' | 'Review' | 'Done' | 'Completed';
  dueDate?: string; // ISO date string
  createdAt: string;
  updatedAt: string;
}

export interface TaskCreateInput {
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status?: 'Todo' | 'InProgress' | 'Review' | 'Done' | 'Completed';
  assignedToId?: string;
  sprintId?: string;
  dueDate?: string;
}

export interface TaskUpdateInput {
  title?: string;
  description?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  status?: 'Todo' | 'InProgress' | 'Review' | 'Done' | 'Completed';
  assignedToId?: string;
  sprintId?: string;
  dueDate?: string;
}
