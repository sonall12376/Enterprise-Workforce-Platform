import mongoose, { Schema, Document } from 'mongoose';

export interface IOfficeLocation extends Document {
  orgId: mongoose.Types.ObjectId;
  name: string;
  timezone: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  geofenceRadius?: number;
  createdAt: Date;
  updatedAt: Date;
}

const OfficeLocationSchema: Schema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true, trim: true },
    timezone: { type: String, required: true, default: 'Asia/Kolkata' },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    geofenceRadius: { type: Number, default: 100 },
  },
  { timestamps: true }
);

export const OfficeLocation = mongoose.model<IOfficeLocation>('OfficeLocation', OfficeLocationSchema);
export default OfficeLocation;
