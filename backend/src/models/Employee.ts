import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IEmployee extends Document {
  employeeId: string;
  email: string;
  passwordHash: string;
  role: 'SuperAdmin' | 'OrgAdmin' | 'Manager' | 'Employee';
  status: 'Active' | 'Onboarding' | 'Suspended' | 'Terminated';
  name: string;
  orgId?: Schema.Types.ObjectId;
  comparePassword(password: string): Promise<boolean>;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    employeeId: {
      type: String,
      required: [true, 'employeeId is required'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'passwordHash is required'],
    },
    role: {
      type: String,
      required: [true, 'role is required'],
      enum: ['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee'],
    },
    status: {
      type: String,
      required: [true, 'status is required'],
      default: 'Active',
      enum: ['Active', 'Onboarding', 'Suspended', 'Terminated'],
    },
    name: {
      type: String,
      required: [true, 'name is required'],
      trim: true,
    },
    orgId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Method to compare candidate password against hashed password
EmployeeSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

export const Employee = model<IEmployee>('Employee', EmployeeSchema);
export default Employee;
