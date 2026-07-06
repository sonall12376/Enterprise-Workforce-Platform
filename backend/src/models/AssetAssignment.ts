import mongoose, { Schema, Document } from 'mongoose';

export interface IAssetAssignment extends Document {
  assetId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  allocatedById: mongoose.Types.ObjectId;
  assignedDate: Date;
  returnedDate?: Date;
  status: 'Active' | 'Returned' | 'Damaged';
  createdAt: Date;
  updatedAt: Date;
}

const AssetAssignmentSchema: Schema = new Schema(
  {
    assetId: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    allocatedById: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    assignedDate: { type: Date, default: Date.now, required: true },
    returnedDate: { type: Date },
    status: {
      type: String,
      enum: ['Active', 'Returned', 'Damaged'],
      default: 'Active',
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes
AssetAssignmentSchema.index({ assetId: 1, status: 1 });
AssetAssignmentSchema.index({ employeeId: 1, status: 1 });

export const AssetAssignment = mongoose.model<IAssetAssignment>('AssetAssignment', AssetAssignmentSchema);
export default AssetAssignment;
