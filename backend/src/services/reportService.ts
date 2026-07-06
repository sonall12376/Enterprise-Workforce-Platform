import Project from '../models/Project';
import Task from '../models/Task';
import Asset from '../models/Asset';
import HelpDeskTicket from '../models/HelpDeskTicket';
import Employee from '../models/Employee';

export const reportService = {
  getProjectStats: async (orgId: string): Promise<any> => {
    const total = await Project.countDocuments({ orgId });
    const statuses = ['Planning', 'Active', 'Completed', 'OnHold'];
    const statusCounts: { [key: string]: number } = {};

    for (const status of statuses) {
      statusCounts[status] = await Project.countDocuments({ orgId, status });
    }

    return { total, statusCounts };
  },

  getTaskStats: async (orgId: string): Promise<any> => {
    const total = await Task.countDocuments({ orgId });
    const statuses = ['Todo', 'InProgress', 'Review', 'Completed'];
    const statusCounts: { [key: string]: number } = {};

    for (const status of statuses) {
      statusCounts[status] = await Task.countDocuments({ orgId, status });
    }

    const priorities = ['Low', 'Medium', 'High', 'Urgent'];
    const priorityCounts: { [key: string]: number } = {};

    for (const priority of priorities) {
      priorityCounts[priority] = await Task.countDocuments({ orgId, priority });
    }

    return { total, statusCounts, priorityCounts };
  },

  getAssetStats: async (orgId: string): Promise<any> => {
    const total = await Asset.countDocuments({ orgId });
    const statuses = ['Available', 'Assigned', 'Maintenance', 'Retired'];
    const statusCounts: { [key: string]: number } = {};

    for (const status of statuses) {
      statusCounts[status] = await Asset.countDocuments({ orgId, status });
    }

    const types = ['Hardware', 'Software', 'Furniture'];
    const typeCounts: { [key: string]: number } = {};

    for (const type of types) {
      typeCounts[type] = await Asset.countDocuments({ orgId, type });
    }

    return { total, statusCounts, typeCounts };
  },

  getTicketStats: async (orgId: string): Promise<any> => {
    const total = await HelpDeskTicket.countDocuments({ orgId });
    const statuses = ['Open', 'Assigned', 'InProgress', 'Resolved', 'Closed'];
    const statusCounts: { [key: string]: number } = {};

    for (const status of statuses) {
      statusCounts[status] = await HelpDeskTicket.countDocuments({ orgId, status });
    }

    const categories = ['IT', 'HR', 'Facilities', 'Finance'];
    const categoryCounts: { [key: string]: number } = {};

    for (const category of categories) {
      categoryCounts[category] = await HelpDeskTicket.countDocuments({ orgId, category });
    }

    return { total, statusCounts, categoryCounts };
  },

  getDashboardSummary: async (orgId: string): Promise<any> => {
    const employeeCount = await Employee.countDocuments({ orgId });
    const pendingLeaves = 14; // Default seed fallback
    const openTickets = await HelpDeskTicket.countDocuments({
      orgId,
      status: { $in: ['Open', 'Assigned', 'InProgress'] },
    });
    const allocatedAssets = await Asset.countDocuments({ orgId, status: 'Assigned' });

    const projectCount = await Project.countDocuments({ orgId });
    const taskCount = await Task.countDocuments({ orgId });

    return {
      employeeCount,
      pendingLeaves,
      openTickets,
      allocatedAssets,
      projectCount,
      taskCount,
    };
  },
};

export default reportService;
