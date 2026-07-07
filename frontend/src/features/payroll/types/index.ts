export interface PayrollRecord {
  _id: string;
  employeeId: string | { _id: string; email: string; employeeId: string; name?: string };
  approvedById?: string;
  month: number;
  year: number;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netPay: number;
  status: 'Draft' | 'PendingApproval' | 'Approved' | 'Paid';
  createdAt: string;
  updatedAt: string;
}
