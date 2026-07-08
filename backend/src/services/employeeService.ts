import Employee, { IEmployee } from '../models/Employee';
import Department from '../models/Department';
import Designation from '../models/Designation';
import OfficeLocation from '../models/OfficeLocation';
import WorkShift from '../models/WorkShift';
import mongoose from 'mongoose';

export const employeeService = {
  create: async (data: any, orgId: string): Promise<IEmployee> => {
    // Check email uniqueness
    const emailExists = await Employee.findOne({ email: data.email });
    if (emailExists) {
      throw new Error('Employee with this email already exists.');
    }

    // Auto-generate employee ID
    const count = await Employee.countDocuments({ orgId });
    const nextNum = String(count + 1).padStart(4, '0');
    const employeeId = `EMP${nextNum}`;

    // Verify self-reference for manager
    if (data.reportingManagerId && data.reportingManagerId === employeeId) {
      throw new Error('An employee cannot be assigned as their own manager.');
    }

    const name = `${data.firstName} ${data.lastName}`;

    const employee = new Employee({
      ...data,
      orgId,
      employeeId,
      name,
      passwordHash: data.passwordHash || '$2a$10$oiQc3aHxbrksxPndNSWbHOv.Ijfq3PezD/x8J/ZUkj.GSNPghrHae', // default hash
      role: data.role || 'Employee',
      status: data.status || 'Active',
      timeline: [
        {
          action: 'Employee Created',
          description: `Employee profile initialized with ID ${employeeId}`,
          performedBy: 'System',
        },
      ],
    });

    return await employee.save();
  },

  getAll: async (
    orgId: string,
    filters: { deptId?: string; status?: string; search?: string },
    pagination: { page: number; limit: number }
  ): Promise<{ employees: IEmployee[]; total: number; pages: number }> => {
    const query: any = { orgId };

    if (filters.deptId) {
      query.deptId = filters.deptId;
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.search) {
      const regex = new RegExp(filters.search, 'i');
      query.$or = [
        { name: regex },
        { email: regex },
        { employeeId: regex },
        { phone: regex },
      ];
    }

    const skip = (pagination.page - 1) * pagination.limit;
    const total = await Employee.countDocuments(query);
    const pages = Math.ceil(total / pagination.limit);

    const employees = await Employee.find(query)
      .populate({ path: 'deptId', select: 'name code' })
      .populate({ path: 'designationId', select: 'title grade' })
      .populate({ path: 'locationId', select: 'name timezone' })
      .populate({ path: 'shiftId', select: 'name startTime endTime' })
      .populate({ path: 'reportingManagerId', select: 'name email employeeId' })
      .sort({ employeeId: 1 })
      .skip(skip)
      .limit(pagination.limit);

    return { employees, total, pages };
  },

  getById: async (id: string, orgId: string): Promise<IEmployee | null> => {
    return await Employee.findOne({ _id: id, orgId })
      .populate({ path: 'deptId', select: 'name code' })
      .populate({ path: 'designationId', select: 'title grade' })
      .populate({ path: 'locationId', select: 'name timezone' })
      .populate({ path: 'shiftId', select: 'name startTime endTime' })
      .populate({ path: 'reportingManagerId', select: 'name email employeeId' });
  },

  update: async (id: string, data: any, orgId: string, performer: string): Promise<IEmployee | null> => {
    const employee = await Employee.findOne({ _id: id, orgId });
    if (!employee) {
      return null;
    }

    // Self manager verification
    if (data.reportingManagerId && data.reportingManagerId.toString() === employee._id.toString()) {
      throw new Error('An employee cannot be assigned as their own manager.');
    }

    const timelineUpdates = [];

    // Track changes for timeline
    if (data.deptId && data.deptId.toString() !== employee.deptId?.toString()) {
      const oldDept = employee.deptId ? await Department.findById(employee.deptId) : null;
      const newDept = await Department.findById(data.deptId);
      timelineUpdates.push({
        action: 'Department Changed',
        description: `Department updated from ${oldDept ? oldDept.name : 'None'} to ${newDept ? newDept.name : 'None'}`,
        performedBy: performer,
      });
    }

    if (data.designationId && data.designationId.toString() !== employee.designationId?.toString()) {
      const oldDesg = employee.designationId ? await Designation.findById(employee.designationId) : null;
      const newDesg = await Designation.findById(data.designationId);
      timelineUpdates.push({
        action: 'Designation Changed',
        description: `Designation updated from ${oldDesg ? oldDesg.title : 'None'} to ${newDesg ? newDesg.title : 'None'}`,
        performedBy: performer,
      });
    }

    if (data.reportingManagerId !== undefined && data.reportingManagerId?.toString() !== employee.reportingManagerId?.toString()) {
      if (data.reportingManagerId) {
        const mgr = await Employee.findById(data.reportingManagerId);
        timelineUpdates.push({
          action: 'Manager Assigned',
          description: `Assigned manager: ${mgr ? mgr.name : 'Unknown'}`,
          performedBy: performer,
        });
      } else {
        timelineUpdates.push({
          action: 'Manager Unassigned',
          description: `Removed manager assignment`,
          performedBy: performer,
        });
      }
    }

    if (data.status && data.status !== employee.status) {
      timelineUpdates.push({
        action: 'Status Changed',
        description: `Status updated from ${employee.status} to ${data.status}`,
        performedBy: performer,
      });
    }

    // Apply basic updates
    Object.assign(employee, data);

    if (data.firstName || data.lastName) {
      employee.name = `${employee.firstName} ${employee.lastName}`;
    }

    // Push timeline updates
    if (timelineUpdates.length > 0) {
      employee.timeline.push(...timelineUpdates.map((t) => ({ ...t, date: new Date() })));
    }

    return await employee.save();
  },

  delete: async (id: string, orgId: string): Promise<IEmployee | null> => {
    // Unassign manager reporting
    await Employee.updateMany({ reportingManagerId: id, orgId }, { $set: { reportingManagerId: null } });
    return await Employee.findOneAndDelete({ _id: id, orgId });
  },

  getOrgMetadata: async (orgId: string) => {
    const depts = await Department.find({ orgId }).select('name code');
    const desgs = await Designation.find({ orgId }).select('title grade deptId');
    const locs = await OfficeLocation.find({ orgId }).select('name timezone');
    const shifts = await WorkShift.find({ orgId }).select('name startTime endTime');
    const managers = await Employee.find({ orgId, role: { $in: ['SuperAdmin', 'OrgAdmin', 'Manager'] } }).select('name employeeId email');
    return { depts, desgs, locs, shifts, managers };
  },
};

export default employeeService;
