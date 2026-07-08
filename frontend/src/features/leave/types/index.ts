export interface LeaveRequestRecord {
  _id: string;
  employeeId: string | { _id: string; email: string; employeeId: string; name?: string };
  approvedById?: string;
  leaveType: 'Casual' | 'Sick' | 'Earned' | 'Unpaid';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalanceRecord {
  _id: string;
  employeeId: string;
  year: number;
  leaveType: 'Casual' | 'Sick' | 'Earned';
  allocated: number;
  used: number;
  pending: number;
  createdAt: string;
  updatedAt: string;
}
