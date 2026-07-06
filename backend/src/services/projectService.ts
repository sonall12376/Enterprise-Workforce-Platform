import Project, { IProject } from '../models/Project';
import Employee, { IEmployee } from '../models/Employee';
import Organization from '../models/Organization';
import mongoose from 'mongoose';

// Helper to ensure dummy organization and employee exist for a given ID (for development testing)
export const ensureDummyOrgAndEmployee = async (orgId: string, employeeId: string) => {
  let org = await Organization.findById(orgId);
  if (!org) {
    org = await Organization.create({
      _id: new mongoose.Types.ObjectId(orgId),
      name: 'Dummy Organization',
      domain: 'dummy.com',
    });
  }

  let emp = await Employee.findById(employeeId);
  if (!emp) {
    emp = await Employee.create({
      _id: new mongoose.Types.ObjectId(employeeId),
      orgId: org._id,
      employeeId: `EMP-${employeeId.substring(18)}`,
      name: 'Dummy Manager',
      email: `manager.${employeeId.substring(18)}@dummy.com`,
      passwordHash: 'dummyhash',
      role: 'Manager',
      status: 'Active',
    });
  }
  return { org, emp };
};

export const projectService = {
  create: async (data: any, orgId: string): Promise<IProject> => {
    const { name, code, startDate, endDate, managerId, status } = data;

    // Ensure referential integrity for development/testing
    await ensureDummyOrgAndEmployee(orgId, managerId);

    // Check if project code already exists
    const existingProject = await Project.findOne({ code });
    if (existingProject) {
      throw new Error(`Project with code "${code}" already exists.`);
    }

    const project = new Project({
      orgId,
      managerId,
      name,
      code,
      startDate,
      endDate,
      status: status || 'Planning',
    });

    return await project.save();
  },

  getAll: async (orgId: string, filters: { status?: string; managerId?: string }): Promise<IProject[]> => {
    const query: any = { orgId };
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.managerId) {
      query.managerId = filters.managerId;
    }

    return await Project.find(query)
      .populate({
        path: 'managerId',
        select: 'name email role employeeId',
      })
      .sort({ createdAt: -1 });
  },

  getById: async (id: string, orgId: string): Promise<IProject | null> => {
    return await Project.findOne({ _id: id, orgId }).populate({
      path: 'managerId',
      select: 'name email role employeeId',
    });
  },

  update: async (id: string, data: any, orgId: string): Promise<IProject | null> => {
    const project = await Project.findOne({ _id: id, orgId });
    if (!project) {
      return null;
    }

    if (data.managerId) {
      await ensureDummyOrgAndEmployee(orgId, data.managerId);
    }

    // If code is changing, check uniqueness
    if (data.code && data.code !== project.code) {
      const existingProject = await Project.findOne({ code: data.code });
      if (existingProject) {
        throw new Error(`Project with code "${data.code}" already exists.`);
      }
    }

    // Update fields
    Object.assign(project, data);
    await project.save();

    return await Project.findById(id).populate({
      path: 'managerId',
      select: 'name email role employeeId',
    });
  },

  delete: async (id: string, orgId: string): Promise<IProject | null> => {
    return await Project.findOneAndDelete({ _id: id, orgId });
  },

  getEligibleManagers: async (orgId: string): Promise<IEmployee[]> => {
    // Seed default dummy managers if DB is empty to prevent blank dropdowns in frontend
    const managersCount = await Employee.countDocuments({ orgId, role: { $in: ['Manager', 'OrgAdmin', 'SuperAdmin'] } });
    if (managersCount === 0) {
      const dummyManagers = [
        {
          _id: new mongoose.Types.ObjectId('603d2e1b12cf000000000010'),
          orgId,
          employeeId: 'EMP-MGR01',
          name: 'Sarah Connor',
          email: 'sarah.connor@wfm.com',
          passwordHash: 'dummyhash',
          role: 'Manager',
          status: 'Active',
        },
        {
          _id: new mongoose.Types.ObjectId('603d2e1b12cf000000000011'),
          orgId,
          employeeId: 'EMP-MGR02',
          name: 'John Miller',
          email: 'john.miller@wfm.com',
          passwordHash: 'dummyhash',
          role: 'Manager',
          status: 'Active',
        },
        {
          _id: new mongoose.Types.ObjectId('603d2e1b12cf000000000012'),
          orgId,
          employeeId: 'EMP-ADMIN01',
          name: 'David Brent',
          email: 'david.brent@wfm.com',
          passwordHash: 'dummyhash',
          role: 'OrgAdmin',
          status: 'Active',
        },
      ];
      await Employee.insertMany(dummyManagers);
    }

    return await Employee.find({
      orgId,
      role: { $in: ['Manager', 'OrgAdmin', 'SuperAdmin'] },
      status: 'Active',
    }).select('name email role employeeId');
  },
};

export default projectService;
