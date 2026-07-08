import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
  orgId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  managerId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema: Schema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    managerId: { type: Schema.Types.ObjectId, ref: 'Employee', default: null },
  },
  { timestamps: true }
);

export const Department = mongoose.model<IDepartment>('Department', DepartmentSchema);
export default Department;
