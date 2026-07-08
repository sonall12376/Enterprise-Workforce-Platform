import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IEmployee extends Document {
  orgId: mongoose.Types.ObjectId;
  employeeId: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: Date;
  joiningDate: Date;
  deptId?: mongoose.Types.ObjectId;
  designationId?: mongoose.Types.ObjectId;
  locationId?: mongoose.Types.ObjectId;
  shiftId?: mongoose.Types.ObjectId;
  reportingManagerId?: mongoose.Types.ObjectId;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
  status: 'Active' | 'Onboarding' | 'Suspended' | 'Terminated';
  role: 'SuperAdmin' | 'OrgAdmin' | 'Manager' | 'Employee';
  passwordHash: string;
  profilePicture?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  timeline: Array<{
    action: string;
    description: string;
    performedBy: string;
    date: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  comparePassword(password: string): Promise<boolean>;
}

const EmployeeSchema: Schema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    employeeId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    dob: { type: Date, required: true },
    joiningDate: { type: Date, default: Date.now },
    deptId: { type: Schema.Types.ObjectId, ref: 'Department' },
    designationId: { type: Schema.Types.ObjectId, ref: 'Designation' },
    locationId: { type: Schema.Types.ObjectId, ref: 'OfficeLocation' },
    shiftId: { type: Schema.Types.ObjectId, ref: 'WorkShift' },
    reportingManagerId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    employmentType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Intern'],
      default: 'Full-time',
    },
    status: {
      type: String,
      enum: ['Active', 'Onboarding', 'Suspended', 'Terminated'],
      default: 'Active',
    },
    role: {
      type: String,
      enum: ['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee'],
      default: 'Employee',
    },
    passwordHash: { type: String, required: true },
    profilePicture: { type: String },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      country: { type: String },
    },
    emergencyContact: {
      name: { type: String, required: true },
      relationship: { type: String, required: true },
      phone: { type: String, required: true },
    },
    timeline: [
      {
        action: { type: String, required: true },
        description: { type: String },
        performedBy: { type: String, default: 'System' },
        date: { type: Date, default: Date.now },
      },
    ],
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    loginAttempts: { type: Number, required: true, default: 0 },
    lockUntil: { type: Date },
  },
  { timestamps: true }
);

// Method to compare candidate password against hashed password
EmployeeSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

// Pre-validate hook to block assigning self as own manager
EmployeeSchema.pre('validate', function(this: any, next) {
  if (this.reportingManagerId && this.reportingManagerId.toString() === this._id.toString()) {
    return next(new Error('An employee cannot be assigned as their own manager.'));
  }
  next();
});

export const Employee = mongoose.model<IEmployee>('Employee', EmployeeSchema);
export default Employee;
