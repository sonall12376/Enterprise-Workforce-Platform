import mongoose, { Schema, Document } from 'mongoose';

export interface IAsset extends Document {
  orgId: mongoose.Types.ObjectId;
  name: string;
  serialNumber: string;
  type: 'Hardware' | 'Software' | 'Furniture';
  status: 'Available' | 'Assigned' | 'Maintenance' | 'Retired';
  createdAt: Date;
  updatedAt: Date;
}

const AssetSchema: Schema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true, trim: true },
    serialNumber: { type: String, required: true, unique: true, trim: true },
    type: {
      type: String,
      enum: ['Hardware', 'Software', 'Furniture'],
      default: 'Hardware',
      required: true,
    },
    status: {
      type: String,
      enum: ['Available', 'Assigned', 'Maintenance', 'Retired'],
      default: 'Available',
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes
AssetSchema.index({ orgId: 1, status: 1 });
AssetSchema.index({ serialNumber: 1 }, { unique: true });

export const Asset = mongoose.model<IAsset>('Asset', AssetSchema);
export default Asset;
