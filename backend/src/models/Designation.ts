import mongoose, { Schema, Document } from 'mongoose';

export interface IDesignation extends Document {
  orgId: mongoose.Types.ObjectId;
  deptId: mongoose.Types.ObjectId;
  title: string;
  grade?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DesignationSchema: Schema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    deptId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    title: { type: String, required: true, trim: true },
    grade: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Designation = mongoose.model<IDesignation>('Designation', DesignationSchema);
export default Designation;
