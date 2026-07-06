import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
  orgId: mongoose.Types.ObjectId;
  employeeId: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'SuperAdmin' | 'OrgAdmin' | 'Manager' | 'Employee';
  status: 'Active' | 'Onboarding' | 'Suspended' | 'Terminated';
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema: Schema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    employeeId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Onboarding', 'Suspended', 'Terminated'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

export const Employee = mongoose.model<IEmployee>('Employee', EmployeeSchema);
export default Employee;
