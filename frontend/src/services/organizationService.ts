import api from './api';

export interface Org {
  _id: string;
  name: string;
  domain: string;
  logoUrl?: string;
  address?: string;
}

export interface Dept {
  _id: string;
  orgId: string;
  name: string;
  code: string;
  managerId?: {
    _id: string;
    name: string;
    email: string;
    employeeId: string;
  } | null;
}

export interface Designation {
  _id: string;
  orgId: string;
  deptId: {
    _id: string;
    name: string;
    code: string;
  };
  title: string;
  grade?: string;
}

export interface OfficeLocation {
  _id: string;
  orgId: string;
  name: string;
  timezone: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  geofenceRadius: number;
}

export interface WorkShift {
  _id: string;
  orgId: string;
  name: string;
  startTime: string;
  endTime: string;
  gracePeriodMins: number;
}

export interface Holiday {
  _id: string;
  orgId: string;
  name: string;
  date: string;
  isOptional: boolean;
}

export const organizationService = {
  // Organizations
  getOrgs: async (): Promise<Org[]> => {
    const res = await api.get('/organizations');
    return res.data.data;
  },
  getOrg: async (id: string): Promise<Org> => {
    const res = await api.get(`/organizations/${id}`);
    return res.data.data;
  },
  updateOrg: async (id: string, data: Partial<Org>): Promise<Org> => {
    const res = await api.put(`/organizations/${id}`, data);
    return res.data.data;
  },

  // Office Locations
  getLocations: async (): Promise<OfficeLocation[]> => {
    const res = await api.get('/office-locations');
    return res.data.data;
  },
  createLocation: async (data: Partial<OfficeLocation>): Promise<OfficeLocation> => {
    const res = await api.post('/office-locations', data);
    return res.data.data;
  },
  updateLocation: async (id: string, data: Partial<OfficeLocation>): Promise<OfficeLocation> => {
    const res = await api.put(`/office-locations/${id}`, data);
    return res.data.data;
  },
  deleteLocation: async (id: string): Promise<void> => {
    await api.delete(`/office-locations/${id}`);
  },

  // Work Shifts
  getShifts: async (): Promise<WorkShift[]> => {
    const res = await api.get('/work-shifts');
    return res.data.data;
  },
  createShift: async (data: Partial<WorkShift>): Promise<WorkShift> => {
    const res = await api.post('/work-shifts', data);
    return res.data.data;
  },
  updateShift: async (id: string, data: Partial<WorkShift>): Promise<WorkShift> => {
    const res = await api.put(`/work-shifts/${id}`, data);
    return res.data.data;
  },
  deleteShift: async (id: string): Promise<void> => {
    await api.delete(`/work-shifts/${id}`);
  },

  // Holidays
  getHolidays: async (): Promise<Holiday[]> => {
    const res = await api.get('/holidays');
    return res.data.data;
  },
  createHoliday: async (data: Partial<Holiday>): Promise<Holiday> => {
    const res = await api.post('/holidays', data);
    return res.data.data;
  },
  updateHoliday: async (id: string, data: Partial<Holiday>): Promise<Holiday> => {
    const res = await api.put(`/holidays/${id}`, data);
    return res.data.data;
  },
  deleteHoliday: async (id: string): Promise<void> => {
    await api.delete(`/holidays/${id}`);
  },

  // Departments
  getDepts: async (): Promise<Dept[]> => {
    const res = await api.get('/departments');
    return res.data.data;
  },
  createDept: async (data: any): Promise<Dept> => {
    const res = await api.post('/departments', data);
    return res.data.data;
  },
  updateDept: async (id: string, data: any): Promise<Dept> => {
    const res = await api.put(`/departments/${id}`, data);
    return res.data.data;
  },
  deleteDept: async (id: string): Promise<void> => {
    await api.delete(`/departments/${id}`);
  },

  // Designations
  getDesignations: async (): Promise<Designation[]> => {
    const res = await api.get('/designations');
    return res.data.data;
  },
  createDesignation: async (data: any): Promise<Designation> => {
    const res = await api.post('/designations', data);
    return res.data.data;
  },
  updateDesignation: async (id: string, data: any): Promise<Designation> => {
    const res = await api.put(`/designations/${id}`, data);
    return res.data.data;
  },
  deleteDesignation: async (id: string): Promise<void> => {
    await api.delete(`/designations/${id}`);
  },
};

export default organizationService;
