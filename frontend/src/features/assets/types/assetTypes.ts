export interface AssignedEmployee {
  _id: string;
  name: string;
  email: string;
  role: string;
  employeeId: string;
}

export interface Asset {
  _id: string;
  orgId: string;
  name: string;
  serialNumber: string;
  type: 'Hardware' | 'Software' | 'Furniture';
  status: 'Available' | 'Assigned' | 'Maintenance' | 'Retired';
  assignedTo?: AssignedEmployee | null;
  assignedDate?: string | null;
  assignmentId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssetCreateInput {
  name: string;
  serialNumber: string;
  type: 'Hardware' | 'Software' | 'Furniture';
  status?: 'Available' | 'Assigned' | 'Maintenance' | 'Retired';
}

export interface AssetUpdateInput {
  name?: string;
  serialNumber?: string;
  type?: 'Hardware' | 'Software' | 'Furniture';
  status?: 'Available' | 'Assigned' | 'Maintenance' | 'Retired';
}
