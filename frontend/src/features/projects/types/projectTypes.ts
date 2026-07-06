export interface Manager {
  _id: string;
  name: string;
  email: string;
  role: string;
  employeeId: string;
}

export interface Project {
  _id: string;
  orgId: string;
  managerId: Manager;
  name: string;
  code: string;
  startDate: string; // ISO date string
  endDate?: string;  // ISO date string
  status: 'Planning' | 'Active' | 'Completed' | 'OnHold';
  createdAt: string;
  updatedAt: string;
}

export interface ProjectCreateInput {
  name: string;
  code: string;
  startDate: string;
  endDate?: string;
  managerId: string;
  status?: 'Planning' | 'Active' | 'Completed' | 'OnHold';
}

export interface ProjectUpdateInput {
  name?: string;
  code?: string;
  startDate?: string;
  endDate?: string;
  managerId?: string;
  status?: 'Planning' | 'Active' | 'Completed' | 'OnHold';
}
