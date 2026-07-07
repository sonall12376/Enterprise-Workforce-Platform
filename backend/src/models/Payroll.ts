import mongoose, { Schema, Document } from 'mongoose';

export interface IPayroll extends Document {
  employeeId: mongoose.Types.ObjectId;
  approvedById?: mongoose.Types.ObjectId;
  month: number; // 1 to 12
  year: number;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netPay: number;
  status: 'Draft' | 'PendingApproval' | 'Approved' | 'Paid';
  createdAt: Date;
  updatedAt: Date;
}

const PayrollSchema = new Schema<IPayroll>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    approvedById: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    baseSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    allowances: {
      type: Number,
      default: 0,
      min: 0,
    },
    deductions: {
      type: Number,
      default: 0,
      min: 0,
    },
    netPay: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Draft', 'PendingApproval', 'Approved', 'Paid'],
      default: 'Draft',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique payroll entry per employee per month/year
PayrollSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.models.Payroll || mongoose.model<IPayroll>('Payroll', PayrollSchema);
