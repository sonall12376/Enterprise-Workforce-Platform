export interface EmployeeTimeline {
  action: string;
  description: string;
  date: string;
  performedBy: string;
}

export interface Employee {
  _id: string;
  orgId: string;
  employeeId: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  joiningDate: string;
  deptId: { _id: string; name: string; code: string } | null;
  designationId: { _id: string; title: string; grade: string } | null;
  locationId: { _id: string; name: string; timezone: string } | null;
  shiftId: { _id: string; name: string; startTime: string; endTime: string } | null;
  reportingManagerId: { _id: string; name: string; employeeId: string; email: string } | null;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
  status: 'Active' | 'Onboarding' | 'Suspended' | 'Terminated';
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  profilePicture?: string;
  timeline: EmployeeTimeline[];
  role: 'SuperAdmin' | 'OrgAdmin' | 'Manager' | 'Employee';
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeCreateInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  joiningDate?: string;
  deptId?: string | null;
  designationId?: string | null;
  locationId?: string | null;
  shiftId?: string | null;
  reportingManagerId?: string | null;
  employmentType?: 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
  status?: 'Active' | 'Onboarding' | 'Suspended' | 'Terminated';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  role?: 'SuperAdmin' | 'OrgAdmin' | 'Manager' | 'Employee';
  password?: string;
}

export interface EmployeeUpdateInput extends Partial<EmployeeCreateInput> {
  profilePicture?: string;
}

export interface OrgMetadata {
  depts: { _id: string; name: string; code: string }[];
  desgs: { _id: string; title: string; grade: string; deptId: string }[];
  locs: { _id: string; name: string; timezone: string }[];
  shifts: { _id: string; name: string; startTime: string; endTime: string }[];
  managers: { _id: string; name: string; employeeId: string; email: string }[];
}
