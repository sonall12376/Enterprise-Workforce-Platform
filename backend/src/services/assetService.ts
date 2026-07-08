import Asset, { IAsset } from '../models/Asset';
import AssetAssignment from '../models/AssetAssignment';
import Employee from '../models/Employee';
import mongoose from 'mongoose';

export const assetService = {
  createAsset: async (orgId: string, data: any): Promise<IAsset> => {
    const { name, serialNumber, type, status } = data;

    const existing = await Asset.findOne({ serialNumber: serialNumber.trim() });
    if (existing) {
      throw new Error('Serial number must be unique across the platform');
    }

    const asset = new Asset({
      orgId,
      name: name.trim(),
      serialNumber: serialNumber.trim(),
      type,
      status: status || 'Available',
    });

    return await asset.save();
  },

  getAssets: async (
    orgId: string,
    filters: any,
    callerId: string,
    callerRole: string
  ): Promise<any[]> => {
    let query: any = { orgId };

    // Enforce role visibility
    if (callerRole === 'Employee') {
      const selfAssignments = await AssetAssignment.find({ employeeId: callerId, status: 'Active' });
      const assetIds = selfAssignments.map((a) => a.assetId);
      query._id = { $in: assetIds };
    } else {
      // Admins/Managers can filter
      if (filters.status) query.status = filters.status;
      if (filters.type) query.type = filters.type;
      if (filters.name) query.name = { $regex: filters.name, $options: 'i' };
      if (filters.serialNumber) query.serialNumber = { $regex: filters.serialNumber, $options: 'i' };
    }

    const assets = await Asset.find(query).sort({ createdAt: -1 }).lean();
    if (assets.length === 0) return [];

    const assetIds = assets.map((a) => a._id);
    const activeAssignments = await AssetAssignment.find({
      assetId: { $in: assetIds },
      status: 'Active',
    })
      .populate({
        path: 'employeeId',
        select: 'name email role employeeId',
      })
      .lean();

    // Map active assignments to asset records
    assets.forEach((asset) => {
      const assignment = activeAssignments.find((aa) => aa.assetId.toString() === asset._id.toString());
      if (assignment) {
        (asset as any).assignedTo = assignment.employeeId;
        (asset as any).assignedDate = assignment.assignedDate;
        (asset as any).assignmentId = assignment._id;
      } else {
        (asset as any).assignedTo = null;
        (asset as any).assignedDate = null;
        (asset as any).assignmentId = null;
      }
    });

    return assets;
  },

  getAssetById: async (orgId: string, id: string): Promise<any> => {
    const asset = await Asset.findOne({ _id: id, orgId }).lean();
    if (!asset) return null;

    const assignment = await AssetAssignment.findOne({ assetId: id, status: 'Active' })
      .populate({
        path: 'employeeId',
        select: 'name email role employeeId',
      })
      .lean();

    if (assignment) {
      (asset as any).assignedTo = assignment.employeeId;
      (asset as any).assignedDate = assignment.assignedDate;
      (asset as any).assignmentId = assignment._id;
    } else {
      (asset as any).assignedTo = null;
      (asset as any).assignedDate = null;
      (asset as any).assignmentId = null;
    }

    return asset;
  },

  updateAsset: async (orgId: string, id: string, data: any): Promise<IAsset | null> => {
    const asset = await Asset.findOne({ _id: id, orgId });
    if (!asset) return null;

    const { name, serialNumber, type, status } = data;

    if (serialNumber && serialNumber.trim() !== asset.serialNumber) {
      const existing = await Asset.findOne({ serialNumber: serialNumber.trim() });
      if (existing) {
        throw new Error('Serial number must be unique across the platform');
      }
      asset.serialNumber = serialNumber.trim();
    }

    if (name !== undefined) asset.name = name.trim();
    if (type !== undefined) asset.type = type;
    if (status !== undefined) asset.status = status;

    return await asset.save();
  },

  deleteAsset: async (orgId: string, id: string): Promise<IAsset | null> => {
    const asset = await Asset.findOne({ _id: id, orgId });
    if (!asset) return null;

    if (asset.status === 'Assigned') {
      throw new Error('Cannot delete an assigned asset. Return it first.');
    }

    // Clean up past returned assignments as well
    await AssetAssignment.deleteMany({ assetId: id });
    return await Asset.findOneAndDelete({ _id: id, orgId });
  },

  assignAsset: async (
    orgId: string,
    assetId: string,
    employeeId: string,
    allocatedById: string
  ): Promise<any> => {
    const asset = await Asset.findOne({ _id: assetId, orgId });
    if (!asset) {
      throw new Error('Asset not found');
    }

    if (asset.status !== 'Available') {
      throw new Error('Cannot allocate an Asset whose status is not Available');
    }

    const employee = await Employee.findOne({ _id: employeeId, orgId });
    if (!employee) {
      throw new Error('Employee not found in this organization');
    }

    // Update asset status
    asset.status = 'Assigned';
    await asset.save();

    // Create assignment entry
    const assignment = new AssetAssignment({
      assetId,
      employeeId,
      allocatedById,
      assignedDate: new Date(),
      status: 'Active',
    });
    await assignment.save();

    return assignment;
  },

  returnAsset: async (orgId: string, assetId: string): Promise<any> => {
    const asset = await Asset.findOne({ _id: assetId, orgId });
    if (!asset) {
      throw new Error('Asset not found');
    }

    const assignment = await AssetAssignment.findOne({ assetId, status: 'Active' });
    if (!assignment) {
      throw new Error('No active assignment record found for this asset');
    }

    // Update assignment details
    assignment.status = 'Returned';
    assignment.returnedDate = new Date();
    await assignment.save();

    // Reset asset status
    asset.status = 'Available';
    await asset.save();

    return assignment;
  },
};

export default assetService;
