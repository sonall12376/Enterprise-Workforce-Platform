export interface Assignee {
  _id: string;
  name: string;
  email: string;
  role: string;
  employeeId: string;
}

export interface Task {
  _id: string;
  projectId: string;
  assignedToId?: Assignee;
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Todo' | 'InProgress' | 'Review' | 'Done';
  dueDate?: string; // ISO date string
  createdAt: string;
  updatedAt: string;
}

export interface TaskCreateInput {
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status?: 'Todo' | 'InProgress' | 'Review' | 'Done';
  assignedToId?: string;
  dueDate?: string;
}

export interface TaskUpdateInput {
  title?: string;
  description?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  status?: 'Todo' | 'InProgress' | 'Review' | 'Done';
  assignedToId?: string;
  dueDate?: string;
}
